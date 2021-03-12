FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
RUN mkdir ./server
COPY ./server/package*.json ./server/
RUN cd ./server
RUN npm install
RUN cd ..

# Prepare for production use
RUN npm ci --only=production

# Bundle app source
COPY . ./

# Set permissions
RUN chmod +rwx ./docker/entrypoint.sh

# rename credential file
RUN mv ./config/credentials_template.js ./config/credentials.js
RUN mv ./config/settings_template.js ./config/settings.js

# communication port
EXPOSE 3000

# Start the server
CMD [ "./docker/entrypoint.sh" ]