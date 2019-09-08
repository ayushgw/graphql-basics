// Dummy users data
const users = [{
    id: 'user1',
    name: 'Ayush Gosi',
    age: 27,
    email: 'ayush@example.com'
}, {
    id: 'user2',
    name: 'Bruce Wayne',
    email: 'bruce@example.com'
}, {
    id: 'user3',
    name: 'Barry Allen',
    age: 35,
    email: 'barry@example.com'
}]

// Dummy Posts Data 
const posts = [{
    id: 'post1',
    title: 'Post One',
    body: 'This is post one body',
    published: true,
    author: 'user1'
}, {
    id: 'post2',
    title: 'Post Two',
    body: 'This is post two body',
    published: false,
    author: 'user1'
}, {
    id: 'post3',
    title: 'Post Three',
    body: 'This is post three body',
    published: true,
    author: 'user2'
}]

// Dummy Comments Data
const comments = [{
    id: 'com1',
    text: 'Dummy Comment One',
    author: 'user3',
    post: 'post1'
}, {
    id: 'com2',
    text: 'Dummy Comment Two',
    author: 'user2',
    post: 'post1'
}, {
    id: 'com3',
    text: 'Dummy Comment Three',
    author: 'user1',
    post: 'post3'
}, {
    id: 'com4',
    text: 'Dummy Comment Four',
    author: 'user2',
    post: 'post2'
}]

export { users, posts, comments }