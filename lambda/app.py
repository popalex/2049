import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

# Add this custom JSON encoder class
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    # For local testing with DynamoDB Local
    if 'LOCAL_TESTING' in os.environ:
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
        # print(response['Items'])
        sorted_items = sorted(items, key=lambda x: x['highScore'], reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
             # Use the custom encoder here
            'body': json.dumps(sorted_items, cls=DecimalEncoder)
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
