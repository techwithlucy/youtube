import os
import argparse
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel

BASE_MODEL = "mistralai/Mistral-7B-v0.1"
ADAPTER_DIR = "lucygpt-out"

HF_CACHE = "/mnt/hf_cache"
if os.path.isdir(HF_CACHE):
    os.environ["HF_HOME"] = HF_CACHE
    os.environ["HF_HUB_CACHE"] = HF_CACHE
    os.environ["TRANSFORMERS_CACHE"] = HF_CACHE

def load_model():
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
    )

    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    base = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        device_map="auto",
        quantization_config=bnb_config,
        torch_dtype=torch.bfloat16,
    )

    model = PeftModel.from_pretrained(base, ADAPTER_DIR)
    model.eval()
    return tokenizer, model

def build_prompt(user_text: str):
    return f"Write in my tone.\n\n{user_text.strip()}\n"

@torch.no_grad()
def generate(tokenizer, model, prompt, max_new_tokens=220, temperature=0.7, top_p=0.9, top_k=50, repetition_penalty=1.05):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

    out = model.generate(
        **inputs,
        max_new_tokens=max_new_tokens,
        do_sample=True,
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )

    text = tokenizer.decode(out[0], skip_special_tokens=True)
    if text.startswith(prompt):
        return text[len(prompt):].lstrip()
    return text

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=str, default=None, help="Prompt to start generation")
    parser.add_argument("--max_new_tokens", type=int, default=220)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--top_p", type=float, default=0.9)
    parser.add_argument("--top_k", type=int, default=50)
    parser.add_argument("--repetition_penalty", type=float, default=1.05)
    args = parser.parse_args()

    tokenizer, model = load_model()

    # CLI mode
    if args.start is not None and args.start.strip() != "":
        prompt = build_prompt(args.start)
        ans = generate(
            tokenizer, model, prompt,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
            top_k=args.top_k,
            repetition_penalty=args.repetition_penalty,
        )
        print(ans)
        return

    # Interactive mode
    print("\nLucyGPT loaded")
    print("Type a prompt and press Enter. Type /q to quit.\n")

    while True:
        user = input("Prompt> ").strip()
        if not user:
            continue
        if user in ["/q", "/quit", "exit"]:
            break

        prompt = build_prompt(user)
        ans = generate(
            tokenizer, model, prompt,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
            top_k=args.top_k,
            repetition_penalty=args.repetition_penalty,
        )
        print("\n--- Output ---")
        print(ans)
        print("-------------\n")

if __name__ == "__main__":
    main()
