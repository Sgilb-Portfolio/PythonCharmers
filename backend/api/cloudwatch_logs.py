import boto3
import time

def get_audit_logs(log_group_name):
    client = boto3.client('logs', region_name='us-east-1')

    now = int(time.time() * 1000)
    startTime = now - (7 * 24 * 60 * 60 * 1000)  # past 7 days

    logs = []
    next_token = None

    while True:
        params = {
            'logGroupName': log_group_name,
            'startTime': startTime,
            'endTime': now,
            'limit': 50,
        }
        if next_token:
            params['nextToken'] = next_token

        response = client.filter_log_events(**params)

        for event in response.get('events', []):
            logs.append({
                'timestamp': event['timestamp'],
                'message': event['message'],
            })

        next_token = response.get('nextToken')
        if not next_token:
            break  # No more pages

    return logs
