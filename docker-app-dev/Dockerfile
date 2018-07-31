FROM node:10-slim

RUN npm install --global npm@6.2.0
RUN npm -v

ENV HOST 0.0.0.0

ENV APP_DIR /app

VOLUME $APP_DIR
WORKDIR /


EXPOSE 3000

COPY run.sh /run.sh
RUN chmod 755 /run.sh


ENTRYPOINT [ "/run.sh"]
CMD ["dev" , "install"]
