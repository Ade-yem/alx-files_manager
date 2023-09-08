import { ObjectID } from 'mongodb';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const users = dbClient.db.collection('users');
    const objID = new ObjectID(userId);
    const user = await users.findOne({ _id: objID });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const {
      name, type, data,
    } = req.body;
    const { parentId } = req.body || 0;
    const { isPublic } = req.body || false;
    const listOfTypes = ['folder', 'file', 'image'];
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !listOfTypes.includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
    const files = dbClient.db.collection('files');
    if (parentId) {
      const objID = new ObjectID(parentId);
      const file = await files.findOne({ _id: objID, user_id: user._id });
      if (!file) return res.status(400).json({ error: 'Parent not found' });
      if (file.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }
    if (type === 'folder') {
      files.insertOne(
        {
          userId: user._id, name, type, isPublic, parentId,
        },
      ).then((result) => res.status(200).json({
        id: result.insertedId, userId: user._id, name, type, isPublic, parentId,
      })).catch((err) => console.log(err));
    } else {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${filePath}/${uuidv4()}`;
      const buff = Buffer.from(data, 'base64');
      try {
        try {
          fs.mkdir(filePath);
        } catch (error) { console.log(error); }
        fs.writeFile(fileName, buff, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      files.insertOne(
        {
          userId: user._id, name, type, isPublic, parentId: parentId || 0, localPath: fileName,
        },
      ).then((result) => {
        res.status(201).json(
          {
            id: result.insertedId, userId: user._id, name, type, isPublic, parentId: parentId || 0,
          },
        );
        // if (type === 'image') {
        //   fileQueue.add(
        //     {
        //       userId: user._id,
        //       fileId: result.insertedId,
        //     },
        //   );
        // }
      }).catch((error) => console.log(error));
    }
    return null;
  }
}

module.exports = FilesController;
