## 00. Pre-requisitos
    - Ter instalado as seguintes ferramentas:
      - vscode (https://code.visualstudio.com/download)
      - nestJS (https://docs.nestjs.com/first-steps)
      - gcloud CLI (https://cloud.google.com/sdk/docs/install?hl=pt-br)
      - WSL2, Docker e Kubernetes (https://docs.docker.com/desktop/install/windows-install/)

## 01. Criar um microservice com o nestJS
```
    - Falar um pouco sobre o NestJS
    - nest new service-nest
```

## 02. Importar o microservice service-nest para o workspace no vscode

## 03. Demonstrar a estrutura padrão criada pelo NestJS

## 04. Subir a aplicação localmente
```
    - npm run start:dev
```

## 05. Usar a extensão Rest Client para criar as chamadas de endpoints
```
    - api.http
    - GET http://localhost:3000
```

## 06. Criar um resource chamado participante como RestAPI
```
    - nest g resource participante
```

## 07. Demonstrar a estrutura criada para o resource participante

## 08. Criar um endpoint que retorna uma lista de participantes
```
    - Criar os atributos na entidade participante (nome, email e idade)
    - Criar uma lista de participantes no service
    - Popular a lista com 2 participantes
    - Retornar essa lista para o controller
```

## 09. Criar a chamada do endpoint de participante
```
    - GET http://localhost:3000/participante
```

## 10. Demonstrar sobre o Docker Desktop e o Kubernetes

## 11. Criar o Dockerfile na raiz do projeto
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

## 12. Acessar o Docker Hub e logar com a conta <USER_DOCKER_HUB>

## 13. Criar a imagem docker
```
    - docker build -t <USER_DOCKER_HUB>/service-a .
```

## 14. Subir imagem criada para o repositório do docker
```
    - docker push <USER_DOCKER_HUB>/service-a
```

## 15. Acessar o console do GCP e demonstrar o cluster Kubernetes criado
```
    - kubectl get namespaces
    - kubectl get deployment
    - kubectl get svc
    - kubectl get pods
```

## 16. Criar o arquivo yaml com o deployment e o service kubernetes
```
    - Criar pasta kubernetes na raiz do projeto
    - Criar arquivo deployment.yaml na pasta kubernetes

apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-nest
spec:
  selector:
    matchLabels:
      app: service-nest
  replicas: 2
  template:
    metadata:
      labels:
        app: service-nest
    spec:
      containers:
        - name: service-nest
          image: lsmendonca/service-nest
          ports:
            - containerPort: 3000

     - Criar arquivo service.yaml na pasta kubernetes

apiVersion: v1
kind: Service
metadata:
  name: service-nest
spec:
  selector:
    app: service-nest
  ports:
    - protocol: TCP
      port: 3000
  type: NodePort
```

## 17. Apontar o kubectl para o kubernetes local
```
    - kubectl config view (contexts)
    - kubectl config use-context docker-desktop
    - Verificar a troca com o passo 15
```    

## 18. Realizar deploy do serviço no Kubernetes Local
```
    - cd kubernetes
    - Verificar se o tipo do Service é NodePort
    - kubectl create -f .
    - Verificar se o pod subiu com kubectl get pods
```

## 19 - Acessar os endpoints pelo api.http
```
    - kubectl get svc
    - GET http://localhost:<PORT>/participante
```

## 20. Apontar o kubectl para o GKE
```
    - kubectl config view (contexts)
    - kubectl config use-context gke_civil-parsec-365301_us-central1_autopilot-cluster-1
    - Verificar a troca com o passo 15
```

## 21. Realizar deploy do servico no GKE
```
    - Alterar o type no arquivo service.yaml para LoadBalancer
    - Aplicar o passo 18
```

## 22. Acessar os endpoints pelo api.http
```
    - kubectl get svc
    - GET http://<EXTERNAL-IP>:3000/participante
```