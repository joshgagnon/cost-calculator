import { select, takeEvery, put, take, call, all } from 'redux-saga/effects';
import { SagaMiddleware, delay, eventChannel, END } from 'redux-saga';
import { updateRender } from '../actions';
import * as Axios from 'axios';
import axios from 'axios';
import { saveAs } from 'file-saver';

export default function *rootSaga(): any {
    yield all([
        renderSaga()
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