# **README.md**

```markdown
# LucyGPT — Build Your Custom AI Clone

> Train an AI model that talks exactly like you using Verda GPU, QLoRA, and Mistral-7B

## What is LucyGPT?

LucyGPT is a personalized AI model trained on your own writing samples. Instead of using a generic ChatGPT, this model learns your unique voice, tone, and writing style — so every response sounds authentically like you.

Whether you need help writing emails, blog posts, LinkedIn articles, or any content, LucyGPT generates text that matches your natural voice and perspective.

---

## Quick Start

This folder contains everything you need to build LucyGPT in under 30 minutes on a Verda GPU.

### What You'll Need

- **Verda GPU Account** — Free tier available at https://www.verda.ai/
- **L40S GPU Instance** — 48GB VRAM (costs ~$1.50-2/hour)
- **Your Writing Samples** — 50KB-500KB of your best writing
- **SSH Access** — To connect to your remote instance

### Free Credits

Use code **LUCY-GPT-25** for $25 free testing credit on Verda (no charges upfront).

---

## Setup Instructions

### Step 1: Create Verda Instance

1. Log in to https://www.verda.ai/
2. Click **Create Instance**
3. Select:
   - GPU: **L40S (48GB)**
   - OS: **Ubuntu 24.04**
   - Storage: **80-100GB**
4. Generate SSH key on your laptop:

```bash
ssh-keygen -t ed25519 -C "verda-lucygpt"
```

Press Enter through the prompts (use defaults).

Show your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

5. Copy the entire output and paste it into Verda's SSH key field
6. Click **Deploy** and wait for the instance to start (1-2 minutes)
7. Copy your **Public IP address** from the instance details

---

### Step 2: Connect to Your Instance

On your laptop terminal:

```bash
ssh -i ~/.ssh/id_ed25519 root@<YOUR_PUBLIC_IP>
```

Replace `<YOUR_PUBLIC_IP>` with the actual IP from Verda.

You're now logged into your remote GPU server!

---

### Step 3: Setup Python Environment

Update system packages:

```bash
apt update && apt -y upgrade
```

Install Python tools:

```bash
apt install -y python3-pip python3-venv
```

Create and activate virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install required libraries:

```bash
pip install torch transformers datasets accelerate peft bitsandbytes trl sentencepiece safetensors
```

This will take a few minutes. Let it finish.

---

### Step 4: Verify GPU & CUDA

Check that your GPU is working:

```bash
python -c "import torch; print('cuda:', torch.cuda.is_available()); print('gpu:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'none')"
```

Expected output:

```
cuda: True
gpu: NVIDIA L40S
```

If you see `cuda: False`, your GPU setup isn't correct. Contact Verda support.

---

### Step 5: Prepare Your Training Data

Create a project folder:

```bash
mkdir -p lucygpt
cd lucygpt
```

Create your training data file:

```bash
nano data.txt
```

**Paste your writing samples here.** Include:
- YouTube scripts
- LinkedIn posts
- Newsletter writing
- Blog articles
- Email drafts
- Anything where your natural voice shows up

**IMPORTANT:** Before pasting, clean your text by removing:
- Sponsor mentions ("This video is sponsored by...")
- Meta-text ("Like and subscribe", "Link in description")
- Timestamps and random headers
- Repeated junk lines
- Anything that isn't authentically your voice

Save the file with `Ctrl+X`, then `Y`, then `Enter`.

Verify your data:

```bash
ls -lh data.txt
wc -c data.txt
```

**Target: 50KB to 500KB of text**

If your file is too small, add more writing samples.

---

### Step 6: Download This Repository

Clone or download the LucyGPT folder to your instance. Or, copy each script file:

Copy `make_data.py` to your instance:

```bash
nano make_data.py
```

Paste the entire script, save with `Ctrl+X`, `Y`, `Enter`.

---

### Step 7: Generate Training Pairs

This script converts your raw text into prompt-response pairs that the model can learn from.

Run:

```bash
python make_data.py
```

You'll see output like:

```
Paragraphs kept: 45
Para words min/median/max: 82 156 312
Joined chunks: 18
Chunk words min/median/max: 267 345 420
Wrote: train.jsonl
Total records: 127
```

This created **train.jsonl** with 127 training examples. Perfect!

---

### Step 8: Train Your Model

Copy `train.py` to your instance:

```bash
nano train.py
```

Paste the entire script, save with `Ctrl+X`, `Y`, `Enter`.

Start training:

```bash
python train.py
```

You'll see:

```
Loading checkpoint shards: 100%|██████████| 2/2 [00:15<00:00,  7.58s/it]
trainable params: 4,194,304 | all params: 3,756,104,192 | trainable%: 0.11%
Epoch 1/2: 100%|██████████| 127/127 [12:34<00:00,  5.94s/it]
```

**This takes 15-30 minutes.** The model is learning your voice. The GPU will be at full utilization — that's exactly what you want. Don't interrupt it.

Once done, you'll see:

```
Saved to: lucygpt-out
Train examples: 127
```

Your trained model is now saved! 

---

### Step 9: Test Your Model

Copy `sample.py` to your instance:

```bash
nano sample.py
```

Paste the entire script, save with `Ctrl+X`, `Y`, `Enter`.

Run the model in interactive mode:

```bash
python sample.py
```

You'll see:

```
LucyGPT loaded
Type a prompt and press Enter. Type /q to quit.

Prompt>
```

Now test it! Type:

```
What is AI Engineering?
```

Press Enter and wait a few seconds for the response.

Try another:

```
How can I start using cloud computing as a beginner?
```

The model should respond in a way that sounds authentically like your voice and writing style — not generic ChatGPT.

Type `/q` to exit.

---

## What Each Script Does

### **make_data.py**

**Purpose:** Converts your raw writing into training pairs

**How it works:**
1. Reads `data.txt`
2. Cleans up whitespace and formatting
3. Chunks text into 260-420 word segments
4. Creates prompt-response pairs (first half = prompt, second half = response)
5. Generates 5 different prompt templates for variety
6. Outputs `train.jsonl` with structured training data

**Output:** `train.jsonl` (one JSON line per training example)

---

### **train.py**

**Purpose:** Fine-tunes Mistral-7B model on your writing

**How it works:**
1. Downloads Mistral-7B base model (7 billion parameters)
2. Applies 4-bit quantization to fit on single GPU (reduces memory from 14GB to 3-4GB)
3. Applies LoRA (Low-Rank Adaptation) — trains only small adapter weights instead of full model
4. Trains for 2 epochs on your prompt-response pairs
5. Saves trained weights to `lucygpt-out/`

**Key settings (adjustable):**
- `EPOCHS = 2` — How many times to train on your data
- `BATCH_SIZE = 1` — Examples per training step
- `LR = 2e-4` — Learning rate (how fast model adapts)
- `GRAD_ACC = 16` — Gradient accumulation for better training

**Output:** `lucygpt-out/` folder with adapter weights and tokenizer

---

### **sample.py**

**Purpose:** Load your trained model and chat with it

**How it works:**
1. Loads base Mistral model in 4-bit mode
2. Loads your trained LoRA adapter from `lucygpt-out/`
3. Merges them into final "LucyGPT" model
4. Provides interactive chat interface
5. Generates responses using your learned patterns

**Modes:**
- **Interactive:** Type prompts one at a time, get responses
- **CLI:** Use `--start "your prompt"` to get single response

**Output:** Text responses in your voice

---

