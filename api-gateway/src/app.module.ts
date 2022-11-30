import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'SERVICE_A',
        transport: Transport.TCP,
        options: {
          host: 'service-a',
          port: 8888,
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'SERVICE_B',
        transport: Transport.TCP,
        options: {
          host: 'service-b',
          port: 8887,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
