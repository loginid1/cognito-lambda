# loginid-cognito-lambda

An integration of Loginid and AWS Cognito authentication with custom authentication Lambdas.

## Requirements

- NodeJS (Frontend)
- Cognito User Pool
- AWS service
- Loginid Dashboard Account

## Features

- Register Passkey
- Login Passkey
- Add Mulitple Passkeys

## LoginID Set-Up

You need the following items with LoginID in order to run this integration:

- LoginID App Base URL
- LoginID App API Key

Here are some general steps:

1. Head over to https://dashboard.loginid.io and login into your account.
2. Click on `Create Application`.
3. Enter a name for your application on the `App Name` field or leave it as default.
4. Enter the `Website URL` of your hosted application. The default URL of the demo locally is `http://localhost:1234` so enter `http://localhost:1234` here.
5. Click on `Complete` button.
6. Enter the `Settings` section.
7. Copy the `Base URL` here.
8. Click on `Add New Key`. Give it a name and select all passkeys scopes. Finish off with `Generate Key`.
   - `passkey:list`
   - `passkey:create`
   - `passkey:update`
   - `passkey:delete`
9. Copy the `Key ID` here.

From here you should have the following needed values:

- App Base URL
- App API Key

## Cognito Set-Up

Running the [CloudFormation](https://aws.amazon.com/cloudformation/) found in `./aws/Template.yaml` will set up the services and the backend needed to run this demo. When the template is finished running, the output will produce three values:

1. PasskeyAPIEndpoint - The backend base URL for the demo
2. UserPoolId - Cognito userpool ID
3. UserPoolClientId - public Cognito client ID

Enter the required parameters when running the template:

1. `LOGINIDBaseURL` - The base URL from LoginID
2. `LOGINIDAPIKeyID` - API key ID required for LoginID backend services

Running the template will create and configure the settings for the following services:

1. Secrets Manager
2. Cognito User Pool
3. Cognito Public Client
4. DefineAuthChallenge Lambda
5. CreateAuthChallenge Lambda
6. VerifyAuthChallenge Lambda
7. API Gateway Proxy
8. Rest API Lambda

The `Secrets Manager` service is needed to securely store the API key ID that was provided from LoginID.

You can delete the CloudFormation stack once you are done with the demo.

## Running Template With AWS CLI

You can run the template and create a stack with the following commands:

```bash
aws cloudformation create-stack \
    --stack-name LOGINID-TEST \
    --template-body file://aws/Template.yaml \
    --parameters \
        ParameterKey="LOGINIDBaseURL",ParameterValue="<APP_BASE_URL>" \
        ParameterKey="LOGINIDAPIKeyID",ParameterValue="<APP_KEY_ID>" \
        ParameterKey="IncludePasskeyAPI",ParameterValue="true" \
    --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
aws cloudformation wait stack-create-complete --stack-name LOGINID-TEST
aws cloudformation describe-stacks --stack-name LOGINID-TEST
```

You can delete the stack once you are complete with:

```bash
aws cloudformation delete-stack --stack-name LOGINID-TEST
aws cloudformation wait stack-delete-complete --stack-name LOGINID-TEST
```

## Demo Set-Up

After completing the execution of the [CloudFormation template](#cognito-set-up), please proceed by adding the following environment variables to an `.env` file with the outputted variables:

```
REACT_PASSKEY_API_BASE_URL=<PasskeyAPIEndpoint>
REACT_COGNITO_USER_POOL_ID=<UserPoolId>
REACT_COGNITO_CLIENT_ID=<UserPoolClientId>
```

## Running Demo

Install the npm packages:

```
npm install
```

Run the demo:

```
npm run dev
```

If you would like to use Docker instead, enter the following commands:

```
docker build -t loginid-cognito .
docker run -p 1234:1234 -v "$(pwd):/usr/src/app" loginid-cognito
```
