import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'
import { PUBLISH_CHANNEL, CONSUME_CHANNEL } from './rabbitmq.constants'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get('AMQP_URI'),
        channels: {
          [PUBLISH_CHANNEL]: {
            prefetchCount: 1,
            default: true
          },
          [CONSUME_CHANNEL]: {
            prefetchCount: 1
          }
        },
        connectionInitOptions: { wait: false }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService]
})
export class SubmissionModule {}
