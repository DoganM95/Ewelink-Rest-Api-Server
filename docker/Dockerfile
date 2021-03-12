FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . ./

# Install app dependencies
RUN cd ./server
RUN npm install

# Prepare for production use
RUN npm ci --only=production

RUN cd ..

# Set permissions
RUN chmod +rwx ./docker/entrypoint.sh

# rename credential file
RUN mv ./config/credentials_template.js ./config/credentials.js
RUN mv ./config/settings_template.js ./config/settings.js

# communication port
EXPOSE 3000

# Start the server
CMD [ "./docker/entrypoint.sh" ]