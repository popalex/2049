import boto3

dynamodb = boto3.client('dynamodb',
    endpoint_url='http://localhost:4566',
    region_name='us-east-1',
    aws_access_key_id='dummy',
    aws_secret_access_key='dummy'
)
print(dynamodb.list_tables())

table = dynamodb.Table('high-scores-table')
response = table.scan()

print(response['Items'])
