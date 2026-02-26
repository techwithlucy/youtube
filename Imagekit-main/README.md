Note: The instructions below are for this video: https://www.youtube.com/watch?v=aIB0p2q9Bd8

## Steps:

## 1️⃣ Create an S3 bucket (for videos)

### Steps

1. Go to **AWS Console → S3**
2. Click **Create bucket**
3. Bucket name:
    
    ```
    imagekit-video-origin-<unique-name>
    ```
    
4. Region: choose **closest to you** (important for latency)
5. **Block ALL public access** (keep bucket private)
6. Leave everything else default
7. Click **Create bucket**

### Upload videos

1. Open the bucket
2. Click **Upload**
3. Upload your `.mp4` files
    
    Example:
    
    ```
    bali.mp4
    london.mp4
    sydney.mp4
    
    ```
    
4. (Optional but recommended) Put them in a folder:
    
    ```
    /travel/bali.mp4
    
    ```
    

---

## 2️⃣ Create IAM user for ImageKit (READ-ONLY)

### Why is it needed?

ImageKit needs **programmatic access** to **read** your S3 videos (nothing else).

### Steps

1. Go to **AWS Console → IAM**
2. Click **Users → Create user**
3. Username:
    
    ```
    imagekit-s3-readonly
    
    ```
    
4. Select **Access key – Programmatic access**
5. Click **Next**

---

## 3️⃣ Create IAM policy (minimal & safe)

### Create policy

1. IAM → **Policies → Create policy**
2. Switch to **JSON**
3. Paste this (REPLACE bucket name):

```json
{
"Version":"2012-10-17",
"Statement":[
{
"Effect":"Allow",
"Action":["s3:GetObject"],
"Resource":"arn:aws:s3:::imagekit-video-origin-<your-bucket-name>/*"
}
]
}

```

✔ This allows **ONLY reading video files**

✔ No delete, no write, no list

1. Click **Next**
2. Policy name:
    
    ```
    ImageKitS3ReadOnly
    
    ```
    
3. Create policy

---

## 4️⃣ Attach policy to IAM user

1. Go back to **IAM → Users**
2. Open `imagekit-s3-readonly`
3. Click **Add permissions**
4. Choose **Attach policies directly**
5. Select `ImageKitS3ReadOnly`
6. Save

---

## 5️⃣ Copy IAM credentials (IMPORTANT)

After user creation:

- Copy **Access Key ID**
- Copy **Secret Access Key**

⚠️ **Save them once,** you won’t see the secret again.

---

## 6️⃣ Integrate S3 with ImageKit (External Storage)

### Steps in the ImageKit dashboard

1. Open **ImageKit Dashboard**
2. Go to **Settings → External Storage**
3. Click **Add External Storage**
4. Choose **AWS S3**

### Fill details

| Field | Value |
| --- | --- |
| Storage Name | `aws-video-origin` |
| Bucket Name | `imagekit-video-origin-<name>` |
| Region | same as S3 bucket |
| Access Key | from IAM |
| Secret Key | from IAM |
| Folder | `/` or `/travel` |
1. Click **Save**
2. Click **Test Connection** ✅

If it succeeds → integration is complete.

---

## 7️⃣ How ImageKit URLs now work

If your file is:

```
s3://imagekit-video-origin/travel/bali.mp4
```

Your ImageKit CDN URL becomes:

```
https://ik.imagekit.io/<imagekit_id>/travel/bali.mp4
```

You can now apply transformations:

```
https://ik.imagekit.io/<imagekit_id>/travel/bali.mp4?tr=so-2,du-8
```

### Commands

**1. Resize/ Crop:**

Here's the basic structure of a URL-based transformation:

```
https://ik.imagekit.io/ikmedia/docs_images/examples/example_food_3.jpg?tr=w-400,h-200
```

**2. Text Overlay:**
    
    ```jsx
    https://ik.imagekit.io/demo/sample-video.mp4?tr=l-text,i-hello,fs-100,co-red,bg-FFFFFF,pa-20,l-end
    ```
    

**3. Create Video Thumbnails**

To get the first frame from the video **`ik-thumbnail.jpg`** after the video resource URL.

**Basic Copy**

```
https://ik.imagekit.io/demo/sample-video.mp4/ik-thumbnail.jpg
```

**4. Adaptive Bitrate Streaming**
    
    Adaptive Bitrate Streaming (ABS) enables the optimum streaming video viewing experience for different types of devices over a broad set of connection speeds. This results in very little buffering, a fast start time and a good experience for both high-end and low-end connections.
    
    ```jsx
    https://ik.imagekit.io/tikz5uqzm/Paris.mp4/ik-master.m3u8?tr=sr-240_360_480_720_1080
    ```
    

📌 Refer to Imagekit’s official documentation for more:

- https://imagekit.io/dashboard/
- https://imagekit.io/docs/overview
