import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import { updateRender, updateSavedList, requestSavedList } from '../actions';
import { initialize } from 'redux-form';
import * as Axios from 'axios';
import axios from 'axios';
import { saveAs } from 'file-saver';

axios.interceptors.request.use(function (config) {
    // Do something before request is sent

    if(config.method !== 'get') {

        if(config.data && config.data.set){
            config.data.set('_csrf_token', window._CSRF_TOKEN);
        }
        else{
            config.data = config.data || {};
            config.data['_csrf_token'] = window._CSRF_TOKEN;
        }
    }
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });



export default function *rootSaga(): any {
    yield all([
        renderSaga(),
        savedListSaga(),
        saveSaga(),
        deleteSaga(),
        loadSaga()
    ]);
}



function *renderSaga() {
    yield takeEvery(CC.Actions.Types.RENDER, render);
    function *render(action: CC.Actions.Render) {
        yield put(updateRender({
            downloadStatus: CC.DownloadStatus.InProgress
        }));
        let data;
        try {
            const response = yield call(axios.post, `/api/render`, action.payload, {responseType: 'arraybuffer' });
            data = response.data;
            yield put(updateRender({
                downloadStatus: CC.DownloadStatus.Complete,
                data
            }));

            var blob = new Blob([data], {type: response.headers['content-type']});
            const disposition = response.headers['content-disposition'];
            const filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)[1].replace(/"/g, '');
            saveAs(blob, filename)
        } catch(e) {
            yield put(updateRender({
                downloadStatus: CC.DownloadStatus.Failed,
            }));
        }
    }

}


function *saveSaga() {
    yield takeEvery(CC.Actions.Types.SAVE_STATE, save);
    function *save(action: CC.Actions.SaveState) {
        yield put(updateSavedList({
            status: CC.DownloadStatus.InProgress
        }));
        let data;
        try {
            let response;
            if(action.payload.saved_id){
                response = yield call(axios.put, `/api/saved/${action.payload.saved_id}`, action.payload);
            }
            else{
                response = yield call(axios.post, `/api/saved`, action.payload);

            }
            data = response.data;
            yield put(updateSavedList({
                status: CC.DownloadStatus.Complete
            }));

        } catch(e) {
            yield put(updateSavedList({
                status: CC.DownloadStatus.Failed,
            }));
        }
    }

}

function *deleteSaga() {
    yield takeEvery(CC.Actions.Types.DELETE_STATE, del);
    function *del(action: CC.Actions.SaveState) {
        yield put(updateSavedList({
            status: CC.DownloadStatus.InProgress
        }));
        let data;
        try {
            let response = yield call(axios.delete, `/api/saved/${action.payload.saved_id}`, action.payload);
            data = response.data;
            yield put(updateSavedList({
                status: CC.DownloadStatus.Complete
            }));

        } catch(e) {
            yield put(updateSavedList({
                status: CC.DownloadStatus.Failed,
            }));
        }
            yield put(requestSavedList({
            }));
    }

}

function *loadSaga() {
    yield takeEvery(CC.Actions.Types.LOAD_STATE, load);
    function *load(action: CC.Actions.LoadState) {
        yield put(updateSavedList({
            status: CC.DownloadStatus.InProgress
        }));
        let data;
        try {
            let response = yield call(axios.get, `/api/saved/${action.payload.saved_id}`);
            data = response.data;

            yield put(updateSavedList({
                status: CC.DownloadStatus.Complete
            }));
            if(data && data.data){
                yield put(initialize('cc', data.data));
            }

        } catch(e) {
            yield put(updateSavedList({
                status: CC.DownloadStatus.Failed,
            }));
        }
    }
}

function *savedListSaga() {
    yield takeEvery(CC.Actions.Types.REQUEST_SAVED_LIST, handle);
    function *handle(action: CC.Actions.RequestSavedList) {
        yield put(updateSavedList({
            status: CC.DownloadStatus.InProgress
        }));
        let data;
        try {
            const response = yield call(axios.get, `/api/saved`);
            data = response.data;
            yield put(updateSavedList({
                status: CC.DownloadStatus.Complete,
                list: data
            }));

        } catch(e) {
            yield put(updateSavedList({
                status: CC.DownloadStatus.Failed,
            }));
        }
    }
}