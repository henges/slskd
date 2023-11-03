import api from "./api"

export const callMetadataSyncer= () => {
    return api.get(`http://burt-mediaserv:8484/`);
}
