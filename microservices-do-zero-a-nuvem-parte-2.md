# Step by step

## Instalar a CLI do Nest de forma global
> $ npm install -g @nestjs/cli

## Criar nova pasta que conterá o nosso ecossistema
> $ mkdir microservice-do-zero-a-nuvem-parte-2
>
> $ cd microservice-do-zero-a-nuvem-parte-2
>
> $ code .
#
# SERVICE A
## Criar o primeiro serviço usando a CLI do NestJS
> $ nest new service-a
>
> Escolha NPM ao invés de YARN (só para facilitar)

## Transformar o primeiro serviço em um microservice
> $ npm i --save @nestjs/microservices

## Atualizar o ponto de entrada do serviço < *src/main.ts* > com a configuração do serviço
```
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: 'service-a',
      port: 8888,
    },
  });
  app.listen().then(() => logger.log('Microservice A is listening'));
}
bootstrap();
```

## Atualizar o < *AppController* > para usar o padrão de mensagem de microsserviço para atender clientes
```
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { of } from "rxjs";
import { delay } from "rxjs/operators";

@Controller()
export class AppController {
  @MessagePattern({ cmd: "ping" })
  ping(_: any) {
    return of("pong").pipe(delay(1000));
  }
}
```
#
# API GATEWAY

## Criar uma API Gateway usando a CLI do NestJS
> $ nest new api-gateway
>
> Escolha NPM ao invés de YARN (só para facilitar)

## Excluir os arquivo < *src/app.controller.spec.ts* >

## Instalar o pacote de microservices do NestJS
> $ npm i --save @nestjs/microservices

## Importar < *ClientModule* > e registrar < *ServiceA* >

## Injetar o novo serviço em < *AppService* > e criar um método para consultar < *ServiceA* >

## Usar o novo método de < *AppService* > em < *AppController* >

## O < *AppModule* > ficará assim
```
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { AppService } from "./app.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "SERVICE_A",
        transport: Transport.TCP,
        options: {
          host: "service-a",
          port: 8888
        }
      }
    ])
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

## O < *AppService* > ficará assim
```
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map } from "rxjs/operators";

@Injectable()
export class AppService {
  constructor(
    @Inject("SERVICE_A") private readonly clientServiceA: ClientProxy
  ) {}

  pingServiceA() {
    const startTs = Date.now();
    const pattern = { cmd: "ping" };
    const payload = {};
    return this.clientServiceA
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }
}
```
## O < *AppController* > ficará assim
```
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping-a")
  pingServiceA() {
    return this.appService.pingServiceA();
  }
}
```
## Iniciar o < *ServiceA* > e a < *ApiGateway* >
> $ npm run start:dev

## Criar um request para < *ApiGateway* > chamando o endpoint *ping-a*
> $ GET http://localhost:3000/ping-a
#
# SERVICE B
## Criar o segundo serviço usando a CLI do NestJS
> $ nest new service-b
>
> Escolha NPM ao invés de YARN (só para facilitar)

## Transformar o primeiro serviço em um microservice
> $ npm i --save @nestjs/microservices

## Atualizar o ponto de entrada do serviço < *src/main.ts* > com a configuração do serviço
```
import { NestFactory } from "@nestjs/core";
import { Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

const logger = new Logger();

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: "0.0.0.0",
      port: 8887
    }
  });
  app.listen().then(() => logger.log('Microservice B is listening'));
}
bootstrap();
```

## Atualizar o < *AppController* > para usar o padrão de mensagem de microsserviço para atender clientes
```
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { of } from "rxjs";
import { delay } from "rxjs/operators";

@Controller()
export class AppController {
  @MessagePattern({ cmd: "ping" })
  ping(_: any) {
    return of("pong").pipe(delay(1000));
  }
}
```
## Registrar < *ServiceB* > em < *API Gateway* >
```
## O < *AppService* > ficará assim
```
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map } from "rxjs/operators";

@Injectable()
export class AppService {
  constructor(
    @Inject("SERVICE_A") private readonly clientServiceA: ClientProxy
    @Inject("SERVICE_B") private readonly clientServiceB: ClientProxy
  ) {}

  pingServiceA() {
    const startTs = Date.now();
    const pattern = { cmd: "ping" };
    const payload = {};
    return this.clientServiceA
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }

  pingServiceB() {
    const startTs = Date.now();
    const pattern = { cmd: "ping" };
    const payload = {};
    return this.clientServiceB
      .send<string>(pattern, payload)
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs }))
      );
  }
}
```
```

## Incluir o Service B no < *AppController* > da API Gateway
```
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { zip } from "rxjs";
import { map } from "rxjs/operators";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/ping-a")
  pingServiceA() {
    return this.appService.pingServiceA();
  }

  @Get("/ping-b")
  pingServiceB() {
    return this.appService.pingServiceB();
  }

  @Get("/ping-all")
  pingAll() {
    return zip(
      this.appService.pingServiceA(),
      this.appService.pingServiceB()
    ).pipe(
      map(([pongServiceA, pongServiceB]) => ({
        pongServiceA,
        pongServiceB
      }))
    );
  }
}
```
## Registrar provider do < *Service B* > em < *AppModule* > do < *ApiGateway* >
```
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
```

## Criar um request para < *ApiGateway* > chamando o endpoint *ping-b*
> $ GET http://localhost:3000/ping-b

## Criar um request para < *ApiGateway* > chamando o endpoint *ping-all*
> $ GET http://localhost:3000/ping-all

# DEPLOY

## Criar o Dockerfile na raiz do < *SERVICE A* > do < *SERVICE B* > e da < *API Gateway* >
```
FROM node:alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build

FROM node:alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod
COPY . .
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]
```

## Criar a imagem docker para o < *SERVICE A* > , < *SERVICE B* > e < *API Gateway* >
> $ docker build -t lsmendonca/service-a .
> $ docker build -t lsmendonca/service-b .
> $ docker build -t lsmendonca/api-gateway .

## Subir as imagens criadas para o repositório do docker
> docker push lsmendonca/service-a
> docker push lsmendonca/service-b
> docker push lsmendonca/api-gateway

## Criar os arquivos yaml com o deployment e o service kubernetes em uma pasta chamada < *K8S* > na raiz do ecossistema

### DeploymentServiceA.yaml
```

apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-a
spec:
  selector:
    matchLabels:
      app: service-a
  replicas: 1
  template:
    metadata:
      labels:
        app: service-a
    spec:
      containers:
        - name: service-a
          image: service-a
          ports:
            - containerPort: 8888
```

### SvcServiceA.yaml
```
apiVersion: v1
kind: Service
metadata:
  name: service-a
spec:
  selector:
    app: service-a
  ports:
    - protocol: TCP
      port: 8888
  type: NodePort
```

### DeploymentServiceB.yaml
```

apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-b
spec:
  selector:
    matchLabels:
      app: service-b
  replicas: 1
  template:
    metadata:
      labels:
        app: service-b
    spec:
      containers:
        - name: service-b
          image: service-b
          ports:
            - containerPort: 8887
```

### SvcServiceB.yaml
```
apiVersion: v1
kind: Service
metadata:
  name: service-b
spec:
  selector:
    app: service-b
  ports:
    - protocol: TCP
      port: 8887
  type: NodePort
```

### DeploymentApiGateway.yaml
```

apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  selector:
    matchLabels:
      app: api-gateway
  replicas: 1
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: api-gateway
          ports:
            - containerPort: 3000
```

### SvcServiceApiGateway.yaml
```
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
    - protocol: TCP
      port: 3000
  type: NodePort
```
## Implantar no Kubernetes Local e no GKE
> $ kubectl apply -f .