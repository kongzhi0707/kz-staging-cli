
const axios = require('../index');

const getRepoList = params => { 
  return axios.request({
    // url: 'https://api.github.com/users/shenyWill/repos',
    url: 'https://api.github.com/users/kongzhi0707/repos',
    params,
    method: 'get'
  })
}

module.exports = { 
  getRepoList,
}