import boto3
import time

def create_table():
    dynamodb = boto3.resource('dynamodb',
        endpoint_url='http://localhost:4566',
        region_name='us-east-1',
        aws_access_key_id='dummy',
        aws_secret_access_key='dummy'
    )

    # Create the DynamoDB table
    table = dynamodb.create_table(
        TableName='GameScores',
        KeySchema=[
            {
                'AttributeName': 'gameId',
                'KeyType': 'HASH'
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'gameId',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'highScore',
                'AttributeType': 'N'
            }
        ],
        GlobalSecondaryIndexes=[
            {
                'IndexName': 'HighScoreIndex',
                'KeySchema': [
                    {
                        'AttributeName': 'gameId',
                        'KeyType': 'HASH'
                    },
                    {
                        'AttributeName': 'highScore',
                        'KeyType': 'RANGE'
                    }
                ],
                'Projection': {
                    'ProjectionType': 'ALL'
                },
                'ProvisionedThroughput': {
                    'ReadCapacityUnits': 1,
                    'WriteCapacityUnits': 1
                }
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 1,
            'WriteCapacityUnits': 1
        }
    )

    # Wait for the table to be created
    table.meta.client.get_waiter('table_exists').wait(TableName='GameScores')
    print("Table created successfully!")

    # Insert some sample data
    sample_data = [
        {
            'gameId': 'GAME1',
            'playerId': 'PLAYER#John',
            'playerName': 'John',
            'highScore': 100,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME2',
            'playerId': 'PLAYER#Jane',
            'playerName': 'Jane',
            'highScore': 200,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME3',
            'playerId': 'PLAYER#Mike',
            'playerName': 'Mike',
            'highScore': 150,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME4',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 300,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME5',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 300,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME6',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 500,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME7',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 2450,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME8',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 3000,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME9',
            'playerId': 'PLAYER#Mike',
            'playerName': 'Mike',
            'highScore': 2093,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME10',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 50,
            'timestamp': int(time.time())
        },
        {
            'gameId': 'GAME11',
            'playerId': 'PLAYER#Sarah',
            'playerName': 'Sarah',
            'highScore': 3020,
            'timestamp': int(time.time())
        }
    ]

    # Insert sample items
    for item in sample_data:
        table.put_item(Item=item)
    
    print("Sample data inserted!")

if __name__ == "__main__":
    create_table()
