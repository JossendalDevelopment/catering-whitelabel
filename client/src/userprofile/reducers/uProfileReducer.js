const initialState = {
    profile : {},
    favorites: [{username: null}],
    reviews: []
}


export default function (state = initialState, action) {
    switch (action.type) {
        case 'GET_USER_PROFILE':
            return {...state, profile: action.payload}
        case 'GET_FAVORITES':
            return {...state, favorites: action.payload}
        case 'REMOVE_FAVORITE':
            return {...state, removeMessage: action.payload}
        case 'GET_USERS_REVIEWS':
            return {...state, reviews: action.payload}
        case 'DELETE_REVIEW':
            return {...state, deleteReviewMessage: action.payload}
        case 'EDIT_REVIEW':
            return {...state, editReviewMessage: action.payload}
        default:
            return state
    }
}
