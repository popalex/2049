import json
import os
import time
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    logger.info(f'Event: {event}')
    http_method = event['httpMethod']
    path = event['path']
    if event.get('body'):
        try:
            body = json.loads(event.get('body'))
        except json.JSONDecodeError:
            body = event.get('body')    
    else:
        body = None

    if http_method == 'GET' and path == '/high-scores':
        return high_score_handler()
    if http_method == 'POST' and path == '/insert-score':
        return insert_score_handler(body)

    # return insert_score_handler(body)
    
    return return_200()

def return_404():
    return {
        'statusCode': 404,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        },
        'body': json.dumps({'error': 'Not Found'})
    }

def return_200():
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'message': 'ok'})
    }

def high_score_handler():
    try:
        logger.info('Starting lambda execution in high_score_handler')

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

        response = table.scan(
            IndexName='HighScoreIndex',
            Select='ALL_ATTRIBUTES'
        )
        
        # Get all items
        items = response['Items']
        
        # Get additional items if there is pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                IndexName='HighScoreIndex',
                Select='ALL_ATTRIBUTES',
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response['Items'])
        
        # Sort items by score in descending order
        sorted_items = sorted(items, key=lambda x: x['highScore'], reverse=True)[:10]
        idx = 1
        for item in sorted_items:
            item['index'] = idx
            idx += 1
        
        result_json = json.dumps(sorted_items, cls=DecimalEncoder)
        
        logger.info(f'DynamoDB response (top 10): {result_json}')

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': result_json
        }
    except Exception as e:
        logger.error(f'Error occurred: {str(e)}', exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            },
            'body': json.dumps({'error': str(e)})
        }

def insert_score_handler(body):

    logger.info('Starting lambda execution in insert_score_handler')

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
    body['timestamp'] = int(time.time())

    try:
        table.put_item(Item=body)
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            },
            'body': json.dumps({'message': 'ok'})
        }
    except Exception as e:
        logger.error(f'Error occurred: {str(e)}', exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            },
            'body': json.dumps({'error': str(e)})
        }
