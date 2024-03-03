FROM node:20-alpine

WORKDIR /usr/src/app

COPY ./contracts/ ./
COPY ./scripts ./
COPY ./package.json ./
COPY ./tsconfig.json ./
COPY ./hardhat.config.ts ./

RUN npm install

COPY . .

# Expose the port
EXPOSE 3000

RUN npx hardhat compile

CMD [ "npm", "run", "deploy-dev" ]