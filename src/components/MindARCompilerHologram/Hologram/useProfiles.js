import { create } from 'zustand'

export const useProfiles = create((set, get) => {
  return {
    showCreateForm: false,
    //
    publicProfiles: [],
    profiles: [],

    createProfile: (profile = {}) => {
      try {
        return (
          fetch(`/api/profiles/profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'createProfile',
              payload: {
                displayName: profile.displayName,
                username: profile.username,
                website: profile.website,
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            //
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              //

              // set((r) => {
              //   return { ...r, profiles: r.profiles.filter((r) => r._id !== _id) }
              // })

              return r.data
            })
          //
        )
      } catch (e) {
        console.error(e)
      }
    },
    removeProfile: (_id) => {
      try {
        return (
          fetch(`/api/profiles/profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'removeProfile',
              payload: {
                //
                _id,
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              //!SECTION

              set((r) => {
                return { ...r, profiles: r.profiles.filter((r) => r._id !== _id) }
              })
            })
            //
            .catch((r) => {
              console.log(r)
            })
        )
      } catch (e) {
        console.error(e)
      }
    },
    loadProfiles: () => {
      try {
        return (
          fetch(`/api/profiles/profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'loadProfiles',
              payload: {
                //
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              set({ profiles: r.data })
            })
          //
        )
      } catch (e) {
        console.error(e)
      }
    },

    //
    loadPublicProfiles: () => {
      try {
        return (
          fetch(`/api/profiles/public-profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'loadPublicProfiles',
              payload: {
                //
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              return r.data
            })
          //
        )
      } catch (e) {
        console.error(e)
      }
    },

    updateProfile: ({ profile }) => {
      //
      try {
        return (
          fetch(`/api/profiles/profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'updateProfile',
              payload: {
                profile,
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              return r.data
            })
          //
        )
      } catch (e) {
        console.error(e)
      }
    },
    loadOneProfile: ({ _id }) => {
      try {
        return (
          fetch(`/api/profiles/profiles`, {
            method: 'POST',
            body: JSON.stringify({
              action: 'loadOneProfile',
              payload: {
                //
                _id,
              },
            }),
            withCredentials: true,
            credentials: 'same-origin',
            mode: 'same-origin',
          })
            .then(async (r) => {
              if (r.ok) {
                return await r.json()
              } else {
                throw await r.text()
              }
            })
            //
            .then((r) => {
              return r.data
            })
          //
        )
      } catch (e) {
        console.error(e)
      }
    },

    //
  }
})
