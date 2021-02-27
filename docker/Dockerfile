FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Copy package*.json 
RUN mkdir ./server
COPY ./server/package*.json ./server

# Install app dependencies
RUN npm install

# Prepare for production use
RUN npm ci --only=production

# Bundle app source
COPY . .

# rename credential file
RUN mv ./config/credentials_template.js ./config/credentials.js
RUN mv ./config/settings_template.js ./config/settings.js

# communication port
EXPOSE 3000

# Start the server
CMD [ "./docker/entrypoint.sh" ]