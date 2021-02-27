# Echo if a environment varible is not passed in run command
if [ -z ${EWELINK_USERNAME} ]; then
    echo "Please define a username using docker run -e var=<your_ewelink_username> ..."
elif [ -z ${EWELINK_PASSWORD} ]; then
    echo "Please define a password using docker run -e var=<your_ewelink_password> ..."
elif [ -z ${EWELINK_REGION} ]; then
    echo "Please define a region using docker run -e var=<your_ewelink_region> ..."
else
    cd /usr/src/app
    sed -i "s/<your_ewelink_email>/$EWELINK_USERNAME/g" ./config/credentials.js
    sed -i "s/<your_ewelink_password>/$EWELINK_PASSWORD/g" ./config/credentials.js
    sed -i "s/<your_ewelink_region>/$EWELINK_REGION/g" ./config/credentials.js
fi

# Run Node js server code
node ./server/server.js
