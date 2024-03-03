FROM node:20-alpine

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./hardhat.config.ts ./

RUN npm install

COPY . .

# Expose the port
EXPOSE 8545

RUN npx hardhat compile

CMD [ "npm", "run", "run-local-node" ]