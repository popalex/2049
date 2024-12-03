import json
import os
import boto3
from boto3.dynamodb.conditions import Key

# 1. Install AWS SAM CLI and docker
# 2. Run DynamoDB Local in a Docker container:
# docker run -p 8000:8000 amazon/dynamodb-local

# 3. Run the create_table script:
# python create_table.py

# 4. Start the local API:
# sam local start-api



def lambda_handler(event, context):
    # For local testing with DynamoDB Local
    if 'AWS_SAM_LOCAL' in os.environ:
        dynamodb = boto3.resource('dynamodb', 
                                endpoint_url='http://localhost:8000',
                                region_name='us-east-1',
                                aws_access_key_id='dummy',
                                aws_secret_access_key='dummy')
    elif 'LOCAL_TESTING' in os.environ:
        dynamodb = boto3.resource('dynamodb',
                                endpoint_url='http://localhost:4566',
                                region_name='us-east-1',
                                aws_access_key_id='dummy',
                                aws_secret_access_key='dummy')
    else:
        dynamodb = boto3.resource('dynamodb')
    
    table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

    try:
        response = table.scan()
        items = response.get('Items', [])
        sorted_items = sorted(items, key=lambda x: x['highScore'], reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(sorted_items)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
