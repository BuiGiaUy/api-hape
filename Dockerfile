FROM node:18.12.0

#fix error when run npm install
RUN npm config set unsafe-perm true

ARG MAX_OLD_SPACE_SIZE=8192
ENV NODE_OPTIONS=--max_old_space_size=$MAX_OLD_SPACE_SIZE

WORKDIR /src

COPY . /src

CMD rm -rf node_modules dist && yarn && yarn build && yarn start:prod