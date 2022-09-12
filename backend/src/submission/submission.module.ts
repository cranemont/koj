import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SubmissionController } from './submission.controller'
import { SubmissionService } from './submission.service'

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        exchanges: [
          {
            name: 'submission-exchange',
            type: 'direct',
            options: { durable: true }
          }
        ],
        uri: config.get('AMQP_URI'),
        channels: {
          'result-consume-channel': {
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
