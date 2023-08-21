# 5 Mini AWS Cloud Project Ideas ☁️

Beginner to Advanced Cloud Projects to help you build hands-on skills in AWS.

## Project #1: Host a website on AWS (Beginner)

This beginner-friendly project will guide you through setting up a personal website using Amazon S3 and connecting it with a custom domain through Amazon Route 53.

### Step #1: Design Your Website
- Design your own personal website or download an existing template.
- You can find free templates at [free-css.com](http://free-css.com).

### Step #2: Set Up Amazon S3 Bucket
- Go to the AWS Management Console and open the Amazon S3 console.
- Click "Create bucket" and enter a unique name for your bucket.
- In the "Properties" section, enable "Static website hosting."
- Upload your website files to the bucket.
- Set the bucket permissions to allow public access.

### Step #3: Purchase a Custom Domain through Amazon Route 53
- Open the Amazon Route 53 console.
- Choose "Domain registration" and then "Register domain."
- Follow the prompts to purchase your custom domain.
- In the "Route 53 hosted zones," create a new record set.
- Enter your S3 bucket's endpoint as the alias target.

### Facing Difficulties?
- [Watch My Full Video Tutorial - "How to Host a Website on AWS"](https://www.youtube.com/watch?v=sCQwEVhCvTg)

### Project Completion Time
- 30 minutes to 1 hour if using an existing template.
- Additional time may be required for customizing the website design.

### Add to Your Resume
Once you've completed this project, you can add this line to your resume: "Hosted a static website on AWS using Amazon S3 and Route 53"

## Project #2: Visualize Data using Amazon QuickSight (Beginner)

In this project, you'll learn how to create visualizations from a large dataset using Amazon S3 and Amazon Quicksight. We'll be working with a dataset of 50,000 best-selling products on Amazon.com.

### Step #1: Download the Dataset
- Navigate to [2-s3-quicksight](https://github.com/techwithlucy/youtube) to download the "Amazon Bestseller Dataset" CSV file and the "manifest.json" file.
- Click on "raw" and Control+S to save both files onto your computer.

### Step #2: Store the Dataset in Amazon S3
- Open the Amazon S3 console and click "Create Bucket."
- Name the bucket (e.g., "lucy-amazon-project") and keep the settings as default.
- Upload the CSV file and the "manifest.json" file into the bucket.
- Replace the URL in the "manifest.json" file with the S3 URL of your dataset.

### Step #3: Connect S3 Bucket with Amazon Quicksight
- Open the AWS management console and navigate to Amazon Quicksight.
- Sign up for a free trial of the Enterprise edition if you don't have an account.
- Select Amazon S3 and tick the box for the S3 bucket you created.
- Enter the link to your "manifest.json" file and connect to Quicksight.
- Select "interactive sheet" to start creating visualizations.

### Step #4: Create Visualizations
- Drag fields into the graph to create visualizations (e.g., Most popular brands).
- Sort, filter, and customize the graphs as desired.
- Experiment with different types of graphs like bar charts, pie charts, line graphs, etc.

### Facing Difficulties?
- [Watch My Full Video Tutorial - "Visualize Data using Amazon QuickSight"](https://www.youtube.com/watch?v=4-8cXuZzKTg)

### Project Completion Time
- Approximately 1-2 hours, depending on the complexity of the visualizations.

### Add to Your Resume
Once you've completed this project, you can add this line to your resume: "Created data visualizations using Amazon S3 and Amazon Quicksight, working with a large dataset of best-selling Amazon products."

## Project #3: Integrate Amazon Lex ChatBot with Facebook Messenger (Intermediate)

In this project, you'll be integrating an Amazon Lex ChatBot with Facebook Messenger to create an interactive chat experience for users.

### Step #1: Create an Amazon Lex ChatBot
- Sign in to the AWS Management Console and open the Amazon Lex console.
- Click "Create" and define the bot's name, output voice, and session timeout.
- Create intents, slots, and sample utterances to define how the bot will interact with users.
- Build and test the bot within the Lex console.

### Step #2: Set Up Facebook Messenger
- Create a Facebook Page and App using the Facebook Developer Portal.
- Generate a Page Access Token for authentication.
- Set up a webhook to receive messages from Facebook users.
- Subscribe the app to the page to enable messaging.

### Step #3: Integrate Amazon Lex with Facebook Messenger
- In the Amazon Lex console, select your bot and choose "Channels."
- Click "Facebook" and enter the required information, including the Page Access Token and App Secret Key.
- Provide the verification token and copy the callback URL.
- Paste the callback URL into the Facebook Developer Portal to link the Lex bot with Facebook Messenger.
- Configure the necessary permissions and settings, such as enabling messaging on the Facebook Page.

### Step #4: Test and Deploy Your ChatBot
- Test your chatbot within Facebook Messenger by sending messages and verifying the responses.
- Review the logs and metrics in the Lex console to identify any issues or areas for improvement.
- Deploy the bot to make it available to Facebook users, following Facebook's review and approval process.

### Facing Difficulties?
- [Amazon Lex Developer Guide](https://docs.aws.amazon.com/lex/latest/dg/what-is.html)
- [Facebook Messenger Platform Documentation](https://developers.facebook.com/docs/messenger-platform)

### Project Completion Time
- Approximately 2-3 hours, depending on the complexity of the chatbot.

### Add to Your Resume
Once you've completed this project, you can add this line to your resume: "Integrated an Amazon Lex ChatBot with Facebook Messenger, creating a responsive conversational interface."

## Project #4: Fortune Teller Application (Intermediate)

Create a "Fortune Teller" application using AWS Lambda, that answers "yes", "no", or "maybe" to user questions.

### Step #1: Set Up an AWS Lambda Function
- Open the AWS Management Console and navigate to the Lambda service.
- Click "Create function" and select "Author from scratch."
- Enter a name for your function and select a runtime (e.g., Python 3.8).
- Under "Function code", write or upload the code for generating random responses.
- Configure the function settings, such as memory, timeout, and execution role.

### Step #2: Write the Fortune-Telling Code
- Import the random module in Python.
- Define a function that generates a random integer between 1 and 3.
- Use conditional statements to map the random integer to a response (e.g., 1 = "yes", 2 = "no", 3 = "maybe").
- Return the response as the output of the Lambda function.

### Step #3: Set Up an API Gateway
- Open the API Gateway service in the AWS console.
- Click "Create API" and choose "HTTP API."
- Define the route, method (e.g., GET), and integration type (Lambda function).
- Select the Lambda function you created earlier.
- Configure the request and response settings as needed.

### Step #4: Deploy Your Code
- In the API Gateway console, click "Deployments" and then "Create."
- Select the stage (e.g., "prod") and deploy the API.
- Copy the API endpoint URL, which users will use to access the fortune teller.

### Step #5: Test Your Code
- Use a tool like Postman or simply your browser to send a GET request to the API endpoint.
- Verify that you receive a "yes", "no", or "maybe" response to each question.
- Test with different questions to ensure the randomness of the responses.

### Facing Difficulties?
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)

### Project Completion Time
- Approximately 2-3 hours.

### Add to Your Resume
Once you've completed this project, you can add this line to your resume: "Built a Fortune Teller application using AWS Lambda and API Gateway, that responds to user questions."

## Project #5: Multi-Tier, Highly Available, Fault-Tolerant Web Application (Advanced)

Refer to [General Immersion Day Guide](https://catalog.workshops.aws/general-immersionday/en-US/advanced-modules) for the full tutorial.

### Project Completion Time
- Approximately 4-6 hours, depending on your familiarity with AWS services.
