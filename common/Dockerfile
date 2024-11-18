FROM node:18-alpine

WORKDIR /app/common

COPY ./package*.json ./
COPY ./tsconfig*.json ./
COPY ./src ./src

RUN npm install

CMD ["npm", "run", "watch"]