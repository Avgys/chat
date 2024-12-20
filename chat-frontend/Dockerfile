FROM node:latest
EXPOSE 3000
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]