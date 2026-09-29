FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

COPY . .

EXPOSE 8081

CMD ["sh", "-c", "npm install --legacy-peer-deps && npx expo start --web --port 8081"]
