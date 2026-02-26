# Complete Fine-Tuning Guide: AWS Job Interview Playbook

This guide helps you build a custom AI coach. It learns from your specific notes so it can answer questions in your voice.

### Step 1: Install Required Tools

Run this first to prepare the environment. These tools allow the model to run fast on the GPU and learn from your data.

```python
import subprocess
import sys

print("Installing required packages...")
packages = ["transformers>=4.41.0", "datasets", "accelerate", "peft", "trl", "bitsandbytes"]

for package in packages:
    subprocess.run([sys.executable, "-m", "pip", "install", "-U", package], check=True)

print("\n Environment is Ready!")

```

---

### Step 2: Prepare the Training Data

This part takes your raw notes and turns them into a format the AI can understand.

**Note:** I have replaced the data with a placeholder. Delete the example text and paste your own notes between the triple quotes.

```python
import json
import re

# --- PASTE YOUR CONTENT BELOW ---
data = """
Q: What is cloud computing?
A: Cloud computing refers to the on-demand delivery of IT resources over the Internet...

[ADD ALL YOUR QUESTIONS AND ANSWERS HERE]
"""
# --- END OF YOUR CONTENT ---

# This script converts your notes into the "Instruction" format the AI needs
raw_pairs = re.split(r'(?=Q:)', data)
records = []

for pair in raw_pairs:
    if "A:" in pair:
        parts = pair.split("A:", 1)
        q_text = parts[0].replace("Q:", "").strip()
        a_text = parts[1].strip()
        full_entry = f"<s>[INST] {q_text} [/INST] {a_text}</s>"
        records.append({"text": full_entry})

with open("train.jsonl", "w", encoding="utf-8") as f:
    for r in records:
        f.write(json.dumps(r) + "\n")

print(f"Created {len(records)} training records in 'train.jsonl'")

```

---

### Step 3: Train the Model (H200 Optimized)

In this script, we use a trick called **LoRA**. It’s a shortcut that lets us add our notes as a small "expert layer" on top of the AI. This saves a lot of time and money. We also use **Bfloat16** to make the H200 chip work at top speed.

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    TrainingArguments, 
    Trainer, 
    DataCollatorForLanguageModeling
)
from peft import LoraConfig, get_peft_model

BASE_MODEL = "mistralai/Mistral-7B-v0.3"
OUT_DIR = "aws-playbook-model"

# 1. Load Data
dataset = load_dataset("json", data_files="train.jsonl", split="train")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

tokenized_ds = dataset.map(lambda x: tokenizer(x["text"], truncation=True, max_length=1024), batched=True)

# 2. Load Model
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.bfloat16, 
    device_map="auto"
)

# 3. LoRA setup
lora_config = LoraConfig(
    r=32, lora_alpha=64,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    task_type="CAUSAL_LM"
)
model = get_peft_model(model, lora_config)

# 4. Training
args = TrainingArguments(
    output_dir=OUT_DIR,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=5e-5,
    num_train_epochs=15,
    bf16=True,
    logging_steps=1,
    save_strategy="no",
    optim="adamw_torch_fused",
    report_to="none"
)

trainer = Trainer(
    model=model, args=args,
    train_dataset=tokenized_ds,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
)

print("Starting training...")
trainer.train()
trainer.model.save_pretrained(OUT_DIR)
tokenizer.save_pretrained(OUT_DIR)
print(f"✅ Training Complete! Saved to: {OUT_DIR}")

```

---

### Step 4: Load and Activate the Model

Run this cell once to "wake up" the model. What’s happening here is we’re loading the base AI and clicking our new training right onto it. This script also sets up the **'ask_ai'** tool to keep the answers clean and focused.

```python
from peft import PeftModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

BASE_MODEL = "mistralai/Mistral-7B-v0.3"
ADAPTER_DIR = "aws-playbook-model"

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
base_model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.bfloat16, device_map="auto")
model = PeftModel.from_pretrained(base_model, ADAPTER_DIR)
model.eval()

def ask_ai(question):
    prompt = f"<s>[INST] {question} [/INST]"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=300, # If answers get cut off, change this to 500
            temperature=0.3,
            repetition_penalty=1.1,
            do_sample=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id
        )
    
    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if "[/INST]" in full_text:
        answer = full_text.split("[/INST]")[-1].strip()
    else:
        answer = full_text.replace(question, "").strip()
    if "Related:" in answer:
        answer = answer.split("Related:")[0].strip()
        
    return answer
    
print("🎉 Model Loaded Successfully! You can now ask your questions.")

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
