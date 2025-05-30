const pkg = require("../package.json");
const nodeFetch = require("node-fetch");

let url = pkg.user ? `${pkg.url}/${pkg.user}` : pkg.url;

let config = `${url}/config.json`;
let news = `${url}/news.json`;

class Config {
    GetConfig() {
        return new Promise((resolve, reject) => {
            nodeFetch(config)
                .then(async (config) => {
                    if (config.status === 200) return resolve(config.json());
                    else
                        return reject({
                            error: {
                                code: config.statusText,
                                message: "Server not accessible",
                            },
                        });
                })
                .catch((error) => {
                    return reject({ error });
                });
        });
    }

    async getInstanceList() {
        let urlInstance = `${url}/files.json`;
        let instances = await nodeFetch(urlInstance)
            .then((res) => res.json())
            .catch((err) => err);
        let instancesList = [];
        instances = Object.entries(instances);

        for (let [name, data] of instances) {
            let instance = data;
            instance.name = name;
            instancesList.push(instance);
        }
        console.log(instancesList);
        return instancesList;
    }

    async getNews() {
        let config = (await this.GetConfig()) || {};

        if (config.rss) {
            return new Promise((resolve, reject) => {
                nodeFetch(config.rss)
                    .then(async (config) => {
                        if (config.status === 200) {
                            let news = [];
                            let response = await config.text();
                            response = JSON.parse(
                                convert.xml2json(response, { compact: true }),
                            )?.rss?.channel?.item;

                            if (!Array.isArray(response)) response = [response];
                            for (let item of response) {
                                news.push({
                                    title: item.title._text,
                                    content: item["content:encoded"]._text,
                                    author: item["dc:creator"]._text,
                                    publish_date: item.pubDate._text,
                                });
                            }
                            return resolve(news);
                        } else
                            return reject({
                                error: {
                                    code: config.statusText,
                                    message: "server not accessible",
                                },
                            });
                    })
                    .catch((error) => reject({ error }));
            });
        } else {
            return new Promise((resolve, reject) => {
                nodeFetch(news)
                    .then(async (config) => {
                        if (config.status === 200)
                            return resolve(config.json());
                        else
                            return reject({
                                error: {
                                    code: config.statusText,
                                    message: "server not accessible",
                                },
                            });
                    })
                    .catch((error) => {
                        return reject({ error });
                    });
            });
        }
    }
}

export default new Config();
