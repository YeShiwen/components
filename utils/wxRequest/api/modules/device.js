
import Http from '@/utils/wxRequest'



export const setDeviceSwitch = data => arg => {
  return Http.request({
    url: 'setDeviceSwitch',
    data,
    method: 'post'
  })
}

export const setDeviceTemperature = data => arg => {
  return Http.request({
    url: 'setDeviceTemperature',
    data,
    method: 'post'
  })
}

export const setDeviceWind = data => arg => {
  return Http.request({
    url: 'setDeviceWind',
    data,
    method: 'post'
  })
}

export const setDevicePattern = data => arg => {
  return Http.request({
    url: 'setDevicePattern',
    data,
    method: 'post'
  })
}


export const getDeviceData = data => arg => {
  return Http.request({
    url: 'getDeviceData',
    data,
    method: 'post'
  })
}

export const getDeviceTemperature = data => arg => {
  return Http.request({
    url: 'getDeviceTemperature',
    data,
    method: 'post'
  })
}

