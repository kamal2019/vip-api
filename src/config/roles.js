const allRoles = {
  user: ['manageLike', 'createParticipation'],
  admin: [
    'getUsers',
    'manageUsers',
    'managePosts',
    'manageLike',
    'manageUser',
    'specialManageUser',
    'manageCertificates',
    'createParticipation',
    'manageParticipations',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
