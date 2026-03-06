## Complete Fine-Tuning Guide: AWS Job Interview Playbook

This guide helps you build a custom AI coach. It learns from your specific notes so it can answer questions in your voice.

### Step 1: Install Required Tools

Run this cell to set up your environment. These libraries allow the model to run efficiently on the GPU and handle the training process.

```python
import subprocess
import sys

print("Installing required packages...")
packages = ["transformers>=4.41.0", "datasets", "accelerate", "peft", "trl", "bitsandbytes", "huggingface_hub", "scikit-learn"]

for package in packages:
    subprocess.run([sys.executable, "-m", "pip", "install", "-U", package], check=True)

print("\n Environment is Ready!")

```

---

### Step 2: Get Your Access Token

To use the Mistral model, you need a free account and a "Read" token from Hugging Face.

1. Go to [huggingface.co](https://huggingface.co/) and sign in.
2. Click on your **Profile Picture** (top right) and go to **Settings**.
3. Click **Access Tokens** on the left sidebar.
4. Click **New Token**, give it a name (like "AWS-Coach"), set it to **Read**, and click **Generate**.
5. Copy that token and paste it when you run the code below.

```python
from huggingface_hub import login
login()

```

---

### Step 3: Prepare the Training Data

This script takes your raw Q&A notes and converts them into the specific instruction format the AI needs to learn. It also splits your data into a "train" set and a "validation" set so we can monitor how well the model is learning.

```python
import json
import re
from sklearn.model_selection import train_test_split

# --- PASTE YOUR CONTENT BELOW ---
data = """
Q: What is cloud computing?
A: Cloud computing refers to the on-demand delivery of IT resources over the Internet...

[ADD ALL YOUR QUESTIONS AND ANSWERS HERE]
"""
# --- END OF YOUR CONTENT ---

# Clean and split the text into pairs
raw_pairs = data.strip().split("Q:")[1:]
records = []

for pair in raw_pairs:
    if "A:" in pair:
        parts = pair.split("A:", 1)
        q_text = parts[0].strip()
        a_text = parts[1].strip()
        # Formatting for the Mistral model
        full_entry = f"<s>[INST] {q_text} [/INST] {a_text}</s>"
        records.append({"text": full_entry})

# Divide data for training and testing
train_data, val_data = train_test_split(records, test_size=0.1, random_state=42)

def save_jsonl(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        for r in data:
            f.write(json.dumps(r) + "\n")

save_jsonl(train_data, "train.jsonl")
save_jsonl(val_data, "val.jsonl")

print(f"Created {len(train_data)} training and {len(val_data)} validation records.")

```

---

### Step 4: Train the Model

This step uses **LoRA** to add a small, specialized layer to the model based on your notes. We use the **SFTTrainer** to handle the formatting and memory management. The settings are tuned to ensure the AI learns to reason rather than just memorizing your text.

```python
import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments
from trl import SFTTrainer
from peft import LoraConfig

BASE_MODEL = "mistralai/Mistral-7B-v0.3"
OUT_DIR = "aws-playbook-model"

# 1. Load the prepared data
dataset = load_dataset("json", data_files={"train": "train.jsonl", "validation": "val.jsonl"})
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
tokenizer.pad_token = tokenizer.eos_token

# 2. Load the base model with 16-bit precision
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)

# 3. Configure the LoRA expert layer
lora_config = LoraConfig(
    r=32, lora_alpha=64,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    task_type="CAUSAL_LM"
)

# 4. Set training parameters
args = TrainingArguments(
    output_dir=OUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4, 
    num_train_epochs=3,
    bf16=True,
    logging_steps=1,
    evaluation_strategy="epoch",
    save_strategy="no",
    report_to="none"
)

# 5. Start the training process
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    peft_config=lora_config,
    dataset_text_field="text",
    max_seq_length=1024,
    tokenizer=tokenizer,
    args=args,
)

print("Starting training...")
trainer.train()
trainer.save_model(OUT_DIR)
print(f"✅ Training Complete! Saved to: {OUT_DIR}")

```

---

### Step 5: Load and Ask Questions

This script loads the base model and attaches your new "expert layer." It includes a function called `ask_ai` that cleans up the answers to make them professional and helpful.

```python
from peft import PeftModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

BASE_MODEL = "mistralai/Mistral-7B-v0.3"
ADAPTER_DIR = "aws-playbook-model"

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
base_model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL, 
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)
model = PeftModel.from_pretrained(base_model, ADAPTER_DIR)
model.eval()

def ask_ai(question):
    prompt = f"<s>[INST] {question} [/INST]"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=300,
            temperature=0.3,
            top_p=0.9,
            repetition_penalty=1.1,
            do_sample=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id
        )
    
    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    answer = full_text.split("[/INST]")[-1].strip()
    return answer
    
print("🎉 Model Loaded! You can now ask questions.")

```

---

### Step 5: Ask Your Questions

Now you can talk to your new AI coach! We use the **print** command so the answers show up clearly on your screen.

```python
print(ask_ai("How do I write an effective resume?"))
print(ask_ai("How do I build a successful cloud portfolio?"))
print(ask_ai("What are the top cloud computing careers?"))

```

---
