/**
 * This module contains middleware that executes all functions related to the comments.
 *
 * @format
 */

import { call, put, select } from 'redux-saga/effects';

import {
  fetchProductComments,
  postComment
} from '../../services/ServerApiService';
import {
  fetchProductCommentsFail,
  fetchProductCommentsSuccess,
  postCommentFail,
  postCommentSuccess,
  setCommentsLoadedToFalse
} from './commentActions';
import { getCurrentProduct } from '../catalogue/catalogueSelector';
import showErrorMessage from '../../utils/showErrorMessage';

const FETCH_COMMENTS_FAIL_MESSAGE =
  "Something has gone wrong. We can't get a list of product comments.";
const POST_COMMENT_FAIL_MESSAGE =
  "Something has gone wrong. We can't post your comment.";

export function* onFetchProductComments() {
  yield put(setCommentsLoadedToFalse());
  try {
    const id = yield select(getCurrentProduct);
    const response = yield call(fetchProductComments, id);
    /** ******************************************************
     * sort product comments by date (the newest in the top) *
     ******************************************************* */
    if (response.data) {
      response.data.sort((a, b) => {
        const aD = new Date(a.created_at);
        const bD = new Date(b.created_at);
        // eslint-disable-next-line no-nested-ternary
        return aD > bD ? -1 : bD > aD ? 1 : 0;
      });
    } else response.data = [];

    yield put(fetchProductCommentsSuccess(id, response.data));
  } catch (error) {
    console.log(`fetchProductComments error: ${error}`);
    showErrorMessage(FETCH_COMMENTS_FAIL_MESSAGE);
    yield put(fetchProductCommentsFail());
    // throw error;
  }
}

export function* onPostComment(action) {
  const { comment, rating } = action;
  try {
    const productId = yield select(getCurrentProduct);
    const response = yield call(postComment, comment, productId, rating);
    if (response.data.success === true) {
      const newComment = {
        created_at: new Date().toString(),
        created_by: {},
        rate: rating,
        text: comment
      };
      yield put(postCommentSuccess(newComment));
    } else {
      showErrorMessage(POST_COMMENT_FAIL_MESSAGE);
      yield put(postCommentFail());
    }
  } catch (error) {
    console.log(`postComment error: ${error}`);
    showErrorMessage(POST_COMMENT_FAIL_MESSAGE);
    yield put(postCommentFail());
  }
}