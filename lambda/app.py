import json
import os
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add this custom JSON encoder class
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        logger.info('Starting lambda execution')
        # logger.info(f'Event received: {json.dumps(event)}')

        # For local testing with DynamoDB Local
        if 'LOCAL_TESTING' in os.environ:
            endpoint_url = os.environ.get('AWS_ENDPOINT_URL')
            logger.info(f'Connecting to DynamoDB at: {endpoint_url}')
            dynamodb = boto3.resource('dynamodb',
                                    endpoint_url=os.environ.get('AWS_ENDPOINT_URL'),
                                    region_name='us-east-1',
                                    aws_access_key_id='dummy',
                                    aws_secret_access_key='dummy')
        else:
            dynamodb = boto3.resource('dynamodb')
        
        table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

        # Log before DynamoDB operation
        logger.info('Attempting to scan DynamoDB table')

        response = table.scan()
        items = response.get('Items', [])
        # print(response['Items'])
        sorted_items = sorted(items, key=lambda x: x['highScore'], reverse=True)
        result_json = json.dumps(sorted_items, cls=DecimalEncoder)
        
        # Log the response (be careful with sensitive data in production)
        logger.info(f'DynamoDB response sorted : {result_json}')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
             # Use the custom encoder here
            'body': result_json
        }
    except Exception as e:
        logger.error(f'Error occurred: {str(e)}', exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
