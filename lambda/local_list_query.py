import boto3

# Use resource instead of client for Table operations
dynamodb = boto3.resource('dynamodb',
    endpoint_url='http://localhost:4566',
    region_name='us-east-1',
    aws_access_key_id='dummy',
    aws_secret_access_key='dummy'
)

# First, let's verify the table exists using the client
dynamodb_client = boto3.client('dynamodb',
    endpoint_url='http://localhost:4566',
    region_name='us-east-1',
    aws_access_key_id='dummy',
    aws_secret_access_key='dummy'
)
print(dynamodb_client.list_tables())

# Now use the resource to get the table and scan it
table = dynamodb.Table('high-scores-table')
response = table.scan()
print("\nTable items:")
print(response['Items'])
