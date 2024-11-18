FROM node:18-alpine

WORKDIR /app/server

COPY ./package*.json ./
COPY ./tsconfig*.json ./

RUN npm install

COPY . ./

EXPOSE 5001

CMD ["npm", "run", "dev"]