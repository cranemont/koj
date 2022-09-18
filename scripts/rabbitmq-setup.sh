#!/bin/sh

while ! nc -z "$RABBITMQ_HOST" "$RABBITMQ_PORT"; do sleep 3; done
>&2 echo "rabbitmq is up - server running..."

# install rabbitmqadmin
wget http://rabbitmq:15672/cli/rabbitmqadmin
chmod +x rabbitmqadmin

# Make an Exchange
./rabbitmqadmin -H rabbitmq -u skku -p 1234 declare exchange name=judger-exchange type=direct

# Make queues
./rabbitmqadmin -H rabbitmq -u skku -p 1234 declare queue name=result-queue durable=true
./rabbitmqadmin -H rabbitmq -u skku -p 1234 declare queue name=submission-queue durable=true

# Make bindings
./rabbitmqadmin -H rabbitmq -u skku -p 1234 declare binding source=judger-exchange\
                                destination_type=queue destination=submission-queue routing_key=submission
./rabbitmqadmin -H rabbitmq -u skku -p 1234 declare binding source=judger-exchange\
                                destination_type=queue destination=result-queue routing_key=result

rm rabbitmqadmin

