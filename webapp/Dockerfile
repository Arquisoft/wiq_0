FROM node:20

COPY . /app
WORKDIR /app
#Remove env file (not necesary for docker)
RUN rm -f .env
#Install the dependencies
RUN npm install

#Create an optimized version of the webapp
RUN npm run build
RUN npm install serve

#Execute npm run prod to run the server
CMD [ "npm", "run", "prod" ]
#CMD ["npm", "start"]