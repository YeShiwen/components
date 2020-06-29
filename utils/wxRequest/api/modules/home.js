
import Http from '@/utils/wxRequest'


export function login(data) {
  return Http.request({
    url: 'login',
    data,
    method: 'post'
  })
}
