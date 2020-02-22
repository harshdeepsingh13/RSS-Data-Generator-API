const {saveNewPost} = require('./Post.model');
const {saveNewTag} = require('./Post.model');
const {responseMessages} = require('../../../config/config');
const {saveNewPicture} = require('./Post.model');
const {logger} = require('../../../config/config');

exports.newPostController = async (req, res, next) => {
  try {
    const {
      picture,
      caption,
    } = req.body;

    let {tags} = req.body;

    const {
      email: userEmail,
    } = req.user;

    if (!picture) {
      req.error = {
        status: 400,
        message: responseMessages[400],
      };
      return next(new Error());
    } else if (!picture.fullUrl || !picture.providerName || !picture.shortName) {
      req.error = {
        status: 400,
        message: responseMessages[400],
      };
      return next(new Error());
    }
    const {pictureId} = await saveNewPicture({
      fullUrl: picture.fullUrl,
      providerName: picture.providerName,
      shortName: picture.shortName,
    });

    tags = await Promise.all(
      tags.map(async tag => {
        if (tag.isNew) {
          let tagDetails;
          tagDetails = await saveNewTag({tag: tag.tag});
          return tagDetails.tagId;
        } else {
          return tag.tagId;
        }
      }),
    );
    await saveNewPost({
      caption,
      tags,
      pictureId,
      userEmail,
    });
    logger.info(`[Post.controller.js] New Post created, request Id - ${req.request.callId}`);
  } catch (e) {
    next(e);
  }
};