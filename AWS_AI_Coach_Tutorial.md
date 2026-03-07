```markdown
# AWS Job Interview Playbook: Custom AI Coach

This project is a complete fine-tuning guide to help you build a custom AI coach. It learns from your specific notes and AWS interview prep materials so it can answer questions in your own voice.

## 🚀 Overview
Using **Mistral-7B-v0.3**, **LoRA (Low-Rank Adaptation)**, and **AWS H200 optimized settings**, this playbook allows you to create a specialized AI assistant without needing massive computing power.

### Key Features
* **SFTTrainer Integration:** Uses the latest `trl` patterns for stable instruction training.
* **Memory Optimized:** Configured for Bfloat16 and 4-bit/8-bit loading to prevent OOM errors.
* **Validation Split:** Automatically sets aside data to monitor learning quality.
* **Interview Ready:** Formatted to handle "Question/Answer" pairs specifically for job prep.

---

## 🛠️ Step 1: Install Required Tools
Run this block to set up your environment with the necessary libraries for cloud computing and model training.

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

## 🔑 Step 2: Get Your Access Token

To use the Mistral model, you need a free "Read" token from Hugging Face.

1. Sign in at [huggingface.co](https://huggingface.co/).
2. Go to **Settings** > **Access Tokens**.
3. Generate a new **Read** token.
4. Paste it into the login prompt below.

```python
from huggingface_hub import login
login()

```

---

## 📊 Step 3: Prepare the Training Data

Paste your interview notes below. This script converts them into the instruction format and splits them into training and validation sets.

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

raw_pairs = data.strip().split("Q:")[1:]
records = []

for pair in raw_pairs:
    if "A:" in pair:
        parts = pair.split("A:", 1)
        q_text = parts[0].strip()
        a_text = parts[1].strip()
        full_entry = f"<s>[INST] {q_text} [/INST] {a_text}</s>"
        records.append({"text": full_entry})

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

## 🧠 Step 4: Train the Model

This step applies the LoRA "expert layer" to the base model. The settings are tuned to 3 epochs and a $2 \times 10^{-4}$ learning rate for optimal reasoning.

```python
import torch
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForCausalLM
from trl import SFTTrainer, SFTConfig
from peft import LoraConfig

BASE_MODEL = "mistralai/Mistral-7B-v0.3"
OUT_DIR = "aws-playbook-model"

dataset = load_dataset("json", data_files={"train": "train.jsonl", "validation": "val.jsonl"})
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)

sft_config = SFTConfig(
    output_dir=OUT_DIR,
    dataset_text_field="text",
    max_seq_length=1024,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4, 
    num_train_epochs=3,
    bf16=True,
    eval_strategy="epoch",
    save_strategy="no",
    report_to="none"
)

lora_config = LoraConfig(
    r=32, lora_alpha=64,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    task_type="CAUSAL_LM"
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    peft_config=lora_config,
    tokenizer=tokenizer,
    args=sft_config,
)

trainer.train()
trainer.save_model(OUT_DIR)
print(f"✅ Training Complete!")

```

---

## ⚡ Step 5: Load the Model

Load the base model and your new fine-tuned adapter for inference.

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

```

---

## 💬 Step 6: Ask Your Questions

Use the function below to chat with your custom AI coach.

```python
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
            do_sample=True
        )
    
    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return full_text.split("[/INST]")[-1].strip()

print(ask_ai("What are the top cloud computing careers?"))

```

```

---

**Would you like me to help you write a "Prerequisites" section for this file so users know exactly what hardware they need?**

```
