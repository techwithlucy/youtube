import os
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    BitsAndBytesConfig,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

# -------------------------
# Config
# -------------------------
BASE_MODEL = os.environ.get("BASE_MODEL", "mistralai/Mistral-7B-v0.1")
DATA_PATH = os.environ.get("DATA_PATH", "train.jsonl")
OUT_DIR = os.environ.get("OUT_DIR", "lucygpt-out")

MAX_SEQ_LEN = int(os.environ.get("MAX_SEQ_LEN", "1024"))
EPOCHS = float(os.environ.get("EPOCHS", "2"))
LR = float(os.environ.get("LR", "2e-4"))
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", "1"))
GRAD_ACC = int(os.environ.get("GRAD_ACC", "16"))

# -------------------------
# Load dataset
# -------------------------
dataset = load_dataset("json", data_files=DATA_PATH, split="train")

def build_text(example):
    prompt = (example.get("prompt") or "").strip()
    response = (example.get("response") or "").strip()
    return {"text": f"{prompt}\n\n{response}".strip()}

dataset = dataset.map(build_text)

# -------------------------
# Tokenizer
# -------------------------
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

def tokenize_fn(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        max_length=MAX_SEQ_LEN,
        padding=False,
    )

tokenized = dataset.map(tokenize_fn, batched=True, remove_columns=dataset.column_names)

# -------------------------
# 4-bit QLoRA config
# -------------------------
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

# -------------------------
# Model (4-bit) + prepare for k-bit training
# -------------------------
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    device_map="auto",
    quantization_config=bnb_config,
)
model.config.use_cache = False

model = prepare_model_for_kbit_training(model)

# -------------------------
# LoRA
# -------------------------
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ],
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# -------------------------
# Training args
# -------------------------
args = TrainingArguments(
    output_dir=OUT_DIR,
    per_device_train_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=GRAD_ACC,
    learning_rate=LR,
    num_train_epochs=EPOCHS,
    logging_steps=5,
    save_steps=50,
    save_total_limit=2,
    bf16=True,
    fp16=False,
    optim="paged_adamw_8bit",
    report_to="none",
)

data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

trainer = Trainer(
    model=model,
    args=args,
    train_dataset=tokenized,
    data_collator=data_collator,
)

trainer.train()

# Save PEFT adapter + tokenizer
model.save_pretrained(OUT_DIR)
tokenizer.save_pretrained(OUT_DIR)

print("Saved to:", OUT_DIR)
print("Train examples:", len(tokenized))
