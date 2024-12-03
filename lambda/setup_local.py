import boto3

def create_table():
    dynamodb = boto3.resource('dynamodb',
        endpoint_url='http://localhost:4566',
        region_name='us-east-1',
        aws_access_key_id='dummy',
        aws_secret_access_key='dummy'
    )

    # Create the DynamoDB table
    table = dynamodb.create_table(
        TableName='high-scores-table',
        KeySchema=[
            {
                'AttributeName': 'index',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'index',
                'AttributeType': 'N'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )

    # Wait for the table to be created
    table.meta.client.get_waiter('table_exists').wait(TableName='high-scores-table')
    print("Table created successfully!")

    # Insert some sample data
    table.put_item(
        Item={
            'index': 1,
            'playerName': 'John',
            'highScore': 100
        }
    )
    table.put_item(
        Item={
            'index': 2,
            'playerName': 'Jane',
            'highScore': 200
        }
    )
    print("Sample data inserted!")

if __name__ == "__main__":
    create_table()
