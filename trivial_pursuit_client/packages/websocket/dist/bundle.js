/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/rsocket-core/build/AuthMetadata.js":
/*!*************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/AuthMetadata.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.encodeWellKnownAuthMetadata = encodeWellKnownAuthMetadata;
exports.encodeCustomAuthMetadata = encodeCustomAuthMetadata;
exports.encodeSimpleAuthMetadata = encodeSimpleAuthMetadata;
exports.encodeBearerAuthMetadata = encodeBearerAuthMetadata;
exports.decodeAuthMetadata = decodeAuthMetadata;
exports.decodeSimpleAuthPayload = decodeSimpleAuthPayload;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");
var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js");
var _WellKnownAuthType = _interopRequireWildcard(
  __webpack_require__(/*! ./WellKnownAuthType */ "../../node_modules/rsocket-core/build/WellKnownAuthType.js")
);
function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

const authTypeIdBytesLength = 1;
const customAuthTypeBytesLength = 1;
const usernameLengthBytesLength = 2;

const streamMetadataKnownMask = 0x80; // 1000 0000
const streamMetadataLengthMask = 0x7f; // 0111 1111

/**
 * Encode Auth metadata with the given {@link WellKnownAuthType} and auth payload {@link Buffer}
 *
 * @param authType well known auth type
 * @param authPayloadBuffer auth payload buffer
 * @returns encoded {@link WellKnownAuthType} and payload {@link Buffer}
 */
function encodeWellKnownAuthMetadata(authType, authPayloadBuffer) {
  if (
    authType === _WellKnownAuthType.UNPARSEABLE_AUTH_TYPE ||
    authType === _WellKnownAuthType.UNKNOWN_RESERVED_AUTH_TYPE
  ) {
    throw new Error(
      `Illegal WellKnownAuthType[${authType.toString()}]. Only allowed AuthType should be used`
    );
  }

  const buffer = (0, _RSocketBufferUtils.createBuffer)(authTypeIdBytesLength);

  // eslint-disable-next-line no-bitwise
  buffer.writeUInt8(authType.identifier | streamMetadataKnownMask);

  return _LiteBuffer.LiteBuffer.concat([buffer, authPayloadBuffer]);
}

/**
 * Encode Auth metadata with the given custom auth type {@link string} and auth payload {@link Buffer}
 *
 * @param customAuthType custom auth type
 * @param authPayloadBuffer auth payload buffer
 * @returns encoded {@link WellKnownAuthType} and payload {@link Buffer}
 */
function encodeCustomAuthMetadata(customAuthType, authPayloadBuffer) {
  const customAuthTypeBuffer = (0, _RSocketBufferUtils.toBuffer)(
    customAuthType
  );

  if (customAuthTypeBuffer.byteLength !== customAuthType.length) {
    throw new Error('Custom auth type must be US_ASCII characters only');
  }
  if (
    customAuthTypeBuffer.byteLength < 1 ||
    customAuthTypeBuffer.byteLength > 128
  ) {
    throw new Error(
      'Custom auth type must have a strictly positive length that fits on 7 unsigned bits, ie 1-128'
    );
  }

  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    customAuthTypeBytesLength + customAuthTypeBuffer.byteLength
  );

  // encoded length is one less than actual length, since 0 is never a valid length, which gives
  // wider representation range
  buffer.writeUInt8(customAuthTypeBuffer.byteLength - 1);
  buffer.write(customAuthType, customAuthTypeBytesLength);

  return _LiteBuffer.LiteBuffer.concat([buffer, authPayloadBuffer]);
}

/**
 * Encode Simple Auth metadata with the given username and password
 *
 * @param username username
 * @param password password
 * @returns encoded {@link SIMPLE} and given username and password as auth payload {@link Buffer}
 */
function encodeSimpleAuthMetadata(username, password) {
  const usernameBuffer = (0, _RSocketBufferUtils.toBuffer)(username);
  const passwordBuffer = (0, _RSocketBufferUtils.toBuffer)(password);
  const usernameLength = usernameBuffer.byteLength;

  if (usernameLength > 65535) {
    throw new Error(
      `Username should be shorter than or equal to 65535 bytes length in UTF-8 encoding but the given was ${usernameLength}`
    );
  }

  const capacity = authTypeIdBytesLength + usernameLengthBytesLength;
  const buffer = (0, _RSocketBufferUtils.createBuffer)(capacity);

  // eslint-disable-next-line no-bitwise
  buffer.writeUInt8(
    _WellKnownAuthType.SIMPLE.identifier | streamMetadataKnownMask
  );
  buffer.writeUInt16BE(usernameLength, 1);

  return _LiteBuffer.LiteBuffer.concat([
    buffer,
    usernameBuffer,
    passwordBuffer,
  ]);
}

/**
 * Encode Bearer Auth metadata with the given token
 *
 * @param token token
 * @returns encoded {@link BEARER} and given token as auth payload {@link Buffer}
 */
function encodeBearerAuthMetadata(token) {
  const tokenBuffer = (0, _RSocketBufferUtils.toBuffer)(token);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(authTypeIdBytesLength);

  // eslint-disable-next-line no-bitwise
  buffer.writeUInt8(
    _WellKnownAuthType.BEARER.identifier | streamMetadataKnownMask
  );

  return _LiteBuffer.LiteBuffer.concat([buffer, tokenBuffer]);
}

/**
 * Decode auth metadata {@link Buffer} into {@link AuthMetadata} object
 *
 * @param metadata auth metadata {@link Buffer}
 * @returns decoded {@link AuthMetadata}
 */
function decodeAuthMetadata(metadata) {
  if (metadata.byteLength < 1) {
    throw new Error(
      'Unable to decode Auth metadata. Not enough readable bytes'
    );
  }

  const lengthOrId = metadata.readUInt8();
  // eslint-disable-next-line no-bitwise
  const normalizedId = lengthOrId & streamMetadataLengthMask;

  if (normalizedId !== lengthOrId) {
    const authType = _WellKnownAuthType.default.fromIdentifier(normalizedId);

    return {
      payload: metadata.slice(1),
      type: {
        identifier: authType.identifier,
        string: authType.string,
      },
    };
  } else {
    // encoded length is realLength - 1 in order to avoid intersection with 0x00 authtype
    const realLength = lengthOrId + 1;
    if (metadata.byteLength < realLength + customAuthTypeBytesLength) {
      throw new Error(
        'Unable to decode custom Auth type. Malformed length or auth type string'
      );
    }

    const customAuthTypeString = metadata.toString(
      'utf8',
      customAuthTypeBytesLength,
      customAuthTypeBytesLength + realLength
    );

    const payload = metadata.slice(realLength + customAuthTypeBytesLength);

    return {
      payload,
      type: {
        identifier: _WellKnownAuthType.UNPARSEABLE_AUTH_TYPE.identifier,
        string: customAuthTypeString,
      },
    };
  }
}

/**
 * Read up to 129 bytes from the given metadata in order to get the custom Auth Type
 *
 * @param authPayload
 * @return sliced username and password buffers
 */
function decodeSimpleAuthPayload(authPayload) {
  if (authPayload.byteLength < usernameLengthBytesLength) {
    throw new Error(
      'Unable to decode Simple Auth Payload. Not enough readable bytes'
    );
  }

  const usernameLength = authPayload.readUInt16BE();

  if (authPayload.byteLength < usernameLength + usernameLengthBytesLength) {
    throw new Error(
      'Unable to decode Simple Auth Payload. Not enough readable bytes'
    );
  }

  const username = authPayload.slice(
    usernameLengthBytesLength,
    usernameLengthBytesLength + usernameLength
  );

  const password = authPayload.slice(
    usernameLengthBytesLength + usernameLength
  );

  return {password, username};
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/CompositeMetadata.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/CompositeMetadata.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.encodeCompositeMetadata = encodeCompositeMetadata;
exports.encodeAndAddCustomMetadata = encodeAndAddCustomMetadata;
exports.encodeAndAddWellKnownMetadata = encodeAndAddWellKnownMetadata;
exports.decodeMimeAndContentBuffersSlices = decodeMimeAndContentBuffersSlices;
exports.decodeMimeTypeFromMimeBuffer = decodeMimeTypeFromMimeBuffer;
exports.encodeCustomMetadataHeader = encodeCustomMetadataHeader;
exports.encodeWellKnownMetadataHeader = encodeWellKnownMetadataHeader;
exports.decodeCompositeMetadata = decodeCompositeMetadata;
exports.WellKnownMimeTypeEntry = exports.ReservedMimeTypeEntry = exports.ExplicitMimeTimeEntry = exports.CompositeMetadata = void 0;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");
var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js");

var _WellKnownMimeType = _interopRequireWildcard(
  __webpack_require__(/*! ./WellKnownMimeType */ "../../node_modules/rsocket-core/build/WellKnownMimeType.js")
);
function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

// $FlowFixMe
class CompositeMetadata {
  constructor(buffer) {
    this._buffer = buffer;
  }

  iterator() {
    return decodeCompositeMetadata(this._buffer);
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return decodeCompositeMetadata(this._buffer);
  }
}

/**
 * Encode an object where key is either {@link WellKnownMimeType} or {@link string}
 * and value as a {@link Buffer} into composite metadata {@link Buffer}
 *
 * @param metadata key-value based object
 * @returns {Buffer}
 */ exports.CompositeMetadata = CompositeMetadata;
function encodeCompositeMetadata(metadata) {
  let encodedCompositeMetadata = (0, _RSocketBufferUtils.createBuffer)(0);
  for (const [metadataKey, metadataValue] of metadata) {
    const metadataRealValue =
      typeof metadataValue === 'function' ? metadataValue() : metadataValue;

    if (
      metadataKey instanceof _WellKnownMimeType.default ||
      typeof metadataKey === 'number' ||
      metadataKey.constructor.name === 'WellKnownMimeType'
    ) {
      encodedCompositeMetadata = encodeAndAddWellKnownMetadata(
        encodedCompositeMetadata,
        metadataKey,
        metadataRealValue
      );
    } else {
      encodedCompositeMetadata = encodeAndAddCustomMetadata(
        encodedCompositeMetadata,
        metadataKey,
        metadataRealValue
      );
    }
  }

  return encodedCompositeMetadata;
}

/**
 * Encode a new sub-metadata information into a composite metadata {@link CompositeByteBuf
 * buffer}, without checking if the {@link String} can be matched with a well known compressable
 * mime type. Prefer using this method and {@link #encodeAndAddMetadata(CompositeByteBuf,
 * ByteBufAllocator, WellKnownMimeType, ByteBuf)} if you know in advance whether or not the mime
 * is well known. Otherwise use {@link #encodeAndAddMetadataWithCompression(CompositeByteBuf,
 * ByteBufAllocator, String, ByteBuf)}
 *
 * @param compositeMetaData the buffer that will hold all composite metadata information.
 * @param allocator the {@link ByteBufAllocator} to use to create intermediate buffers as needed.
 * @param customMimeType the custom mime type to encode.
 * @param metadata the metadata value to encode.
 */
// see #encodeMetadataHeader(ByteBufAllocator, String, int)
function encodeAndAddCustomMetadata(
  compositeMetaData,
  customMimeType,
  metadata
) {
  return _LiteBuffer.LiteBuffer.concat([
    compositeMetaData,
    encodeCustomMetadataHeader(customMimeType, metadata.byteLength),
    metadata,
  ]);
}

/**
 * Encode a new sub-metadata information into a composite metadata {@link CompositeByteBuf
 * buffer}.
 *
 * @param compositeMetadata the buffer that will hold all composite metadata information.
 * @param allocator the {@link ByteBufAllocator} to use to create intermediate buffers as needed.
 * @param knownMimeType the {@link WellKnownMimeType} to encode.
 * @param metadata the metadata value to encode.
 */
// see #encodeMetadataHeader(ByteBufAllocator, byte, int)
function encodeAndAddWellKnownMetadata(
  compositeMetadata,
  knownMimeType,
  metadata
) {
  let mimeTypeId;

  if (Number.isInteger(knownMimeType)) {
    mimeTypeId = knownMimeType;
  } else {
    mimeTypeId = knownMimeType.identifier;
  }

  return _LiteBuffer.LiteBuffer.concat([
    compositeMetadata,
    encodeWellKnownMetadataHeader(mimeTypeId, metadata.byteLength),
    metadata,
  ]);
}

/**
 * Decode the next metadata entry (a mime header + content pair of {@link ByteBuf}) from   a {@link
 * ByteBuf} that contains at least enough bytes for one more such entry. These buffers are
 * actually slices of the full metadata buffer, and this method doesn't move the full metadata
 * buffer's {@link ByteBuf#readerIndex()}. As such, it requires the user to provide an {@code
 * index} to read from. The next index is computed by calling {@link #computeNextEntryIndex(int,
 * ByteBuf, ByteBuf)}. Size of the first buffer (the "header buffer") drives which decoding method
 * should be further applied to it.
 *
 * <p>The header buffer is either:
 *
 * <ul>
 *   <li>made up of a single byte: this represents an encoded mime id, which can be further
 *       decoded using {@link #decodeMimeIdFromMimeBuffer(ByteBuf)}
 *   <li>made up of 2 or more bytes: this represents an encoded mime String + its length, which
 *       can be further decoded using {@link #decodeMimeTypeFromMimeBuffer(ByteBuf)}. Note the
 *       encoded length, in the first byte, is skipped by this decoding method because the
 *       remaining length of the buffer is that of the mime string.
 * </ul>
 *
 * @param compositeMetadata the source {@link ByteBuf} that originally contains one or more
 *     metadata entries
 * @param entryIndex the {@link ByteBuf#readerIndex()} to start decoding from. original reader
 *     index is kept on the source buffer
 * @param retainSlices should produced metadata entry buffers {@link ByteBuf#slice() slices} be
 *     {@link ByteBuf#retainedSlice() retained}?
 * @return a {@link ByteBuf} array of length 2 containing the mime header buffer
 *     <strong>slice</strong> and the content buffer <strong>slice</strong>, or one of the
 *     zero-length error constant arrays
 */
function decodeMimeAndContentBuffersSlices(compositeMetadata, entryIndex) {
  const mimeIdOrLength = compositeMetadata.readInt8(entryIndex);
  let mime;
  let toSkip = entryIndex;
  if (
    (mimeIdOrLength & STREAM_METADATA_KNOWN_MASK) ===
    STREAM_METADATA_KNOWN_MASK
  ) {
    mime = compositeMetadata.slice(toSkip, toSkip + 1);
    toSkip += 1;
  } else {
    // M flag unset, remaining 7 bits are the length of the mime
    const mimeLength = (mimeIdOrLength & 0xff) + 1;

    if (compositeMetadata.byteLength > toSkip + mimeLength) {
      // need to be able to read an extra mimeLength bytes (we have already read one so byteLength should be strictly more)
      // here we need a way for the returned ByteBuf to differentiate between a
      // 1-byte length mime type and a 1 byte encoded mime id, preferably without
      // re-applying the byte mask. The easiest way is to include the initial byte
      // and have further decoding ignore the first byte. 1 byte buffer == id, 2+ byte
      // buffer == full mime string.
      mime = compositeMetadata.slice(toSkip, toSkip + mimeLength + 1);

      // we thus need to skip the bytes we just sliced, but not the flag/length byte
      // which was already skipped in initial read
      toSkip += mimeLength + 1;
    } else {
      throw new Error(
        'Metadata is malformed. Inappropriately formed Mime Length'
      );
    }
  }

  if (compositeMetadata.byteLength >= toSkip + 3) {
    // ensures the length medium can be read
    const metadataLength = (0, _RSocketBufferUtils.readUInt24BE)(
      compositeMetadata,
      toSkip
    );
    toSkip += 3;
    if (compositeMetadata.byteLength >= metadataLength + toSkip) {
      const metadata = compositeMetadata.slice(toSkip, toSkip + metadataLength);
      return [mime, metadata];
    } else {
      throw new Error(
        'Metadata is malformed. Inappropriately formed Metadata Length or malformed content'
      );
    }
  } else {
    throw new Error(
      'Metadata is malformed. Metadata Length is absent or malformed'
    );
  }
}

/**
 * Decode a {@link CharSequence} custome mime type from a {@link ByteBuf}, assuming said buffer
 * properly contains such a mime type.
 *
 * <p>The buffer must at least have two readable bytes, which distinguishes it from the {@link
 * #decodeMimeIdFromMimeBuffer(ByteBuf) compressed id} case. The first byte is a size and the
 * remaining bytes must correspond to the {@link CharSequence}, encoded fully in US_ASCII. As a
 * result, the first byte can simply be skipped, and the remaining of the buffer be decoded to the
 * mime type.
 *
 * <p>If the mime header buffer is less than 2 bytes long, returns {@code null}.
 *
 * @param flyweightMimeBuffer the mime header {@link ByteBuf} that contains length + custom mime
 *     type
 * @return the decoded custom mime type, as a {@link CharSequence}, or null if the input is
 *     invalid
 * @see #decodeMimeIdFromMimeBuffer(ByteBuf)
 */
function decodeMimeTypeFromMimeBuffer(flyweightMimeBuffer) {
  if (flyweightMimeBuffer.length < 2) {
    throw new Error('Unable to decode explicit MIME type');
  }
  // the encoded length is assumed to be kept at the start of the buffer
  // but also assumed to be irrelevant because the rest of the slice length
  // actually already matches _decoded_length
  return flyweightMimeBuffer.toString('ascii', 1);
}

function encodeCustomMetadataHeader(customMime, metadataLength) {
  const metadataHeader = (0, _RSocketBufferUtils.createBuffer)(
    4 + customMime.length
  );
  // reserve 1 byte for the customMime length
  // /!\ careful not to read that first byte, which is random at this point
  // int writerIndexInitial = metadataHeader.writerIndex();
  // metadataHeader.writerIndex(writerIndexInitial + 1);

  // write the custom mime in UTF8 but validate it is all ASCII-compatible
  // (which produces the right result since ASCII chars are still encoded on 1 byte in UTF8)
  const customMimeLength = metadataHeader.write(customMime, 1);
  if (!isAscii(metadataHeader, 1)) {
    throw new Error('Custom mime type must be US_ASCII characters only');
  }
  if (customMimeLength < 1 || customMimeLength > 128) {
    throw new Error(
      'Custom mime type must have a strictly positive length that fits on 7 unsigned bits, ie 1-128'
    );
  }
  // encoded length is one less than actual length, since 0 is never a valid length, which gives
  // wider representation range
  metadataHeader.writeUInt8(customMimeLength - 1);

  (0, _RSocketBufferUtils.writeUInt24BE)(
    metadataHeader,
    metadataLength,
    customMimeLength + 1
  );

  return metadataHeader;
}

/**
 * Encode a {@link WellKnownMimeType well known mime type} and a metadata value length into a
 * newly allocated {@link ByteBuf}.
 *
 * <p>This compact representation encodes the mime type via its ID on a single byte, and the
 * unsigned value length on 3 additional bytes.
 *
 * @param allocator the {@link ByteBufAllocator} to use to create the buffer.
 * @param mimeType a byte identifier of a {@link WellKnownMimeType} to encode.
 * @param metadataLength the metadata length to append to the buffer as an unsigned 24 bits
 *     integer.
 * @return the encoded mime and metadata length information
 */
function encodeWellKnownMetadataHeader(mimeType, metadataLength) {
  const buffer = _LiteBuffer.LiteBuffer.alloc(4);

  buffer.writeUInt8(mimeType | STREAM_METADATA_KNOWN_MASK);
  (0, _RSocketBufferUtils.writeUInt24BE)(buffer, metadataLength, 1);

  return buffer;
}

/**
 * Decode given {@link Buffer} into {@link Iterator<Entry>}
 *
 * @param buffer encoded Composite Metadata content
 * @returns {Iterator<Entry>}
 * @since 0.0.21
 */
function* decodeCompositeMetadata(buffer) {
  const length = buffer.byteLength;
  let entryIndex = 0;

  while (entryIndex < length) {
    const headerAndData = decodeMimeAndContentBuffersSlices(buffer, entryIndex);

    const header = headerAndData[0];
    const data = headerAndData[1];

    entryIndex = computeNextEntryIndex(entryIndex, header, data);

    if (!isWellKnownMimeType(header)) {
      const typeString = decodeMimeTypeFromMimeBuffer(header);
      if (!typeString) {
        throw new Error('MIME type cannot be null');
      }

      yield new ExplicitMimeTimeEntry(data, typeString);
      continue;
    }

    const id = decodeMimeIdFromMimeBuffer(header);
    const type = _WellKnownMimeType.default.fromIdentifier(id);
    if (_WellKnownMimeType.UNKNOWN_RESERVED_MIME_TYPE === type) {
      yield new ReservedMimeTypeEntry(data, id);
      continue;
    }

    yield new WellKnownMimeTypeEntry(data, type);
  }
}

class ExplicitMimeTimeEntry {
  constructor(content, type) {
    this._content = content;
    this._type = type;
  }

  get content() {
    return this._content;
  }

  get mimeType() {
    return this._type;
  }
}
exports.ExplicitMimeTimeEntry = ExplicitMimeTimeEntry;

class ReservedMimeTypeEntry {
  constructor(content, type) {
    this._content = content;
    this._type = type;
  }

  get content() {
    return this._content;
  }

  /**
   * {@inheritDoc} Since this entry represents a compressed id that couldn't be decoded, this is
   * always {@code null}.
   */
  get mimeType() {
    return undefined;
  }

  /**
   * Returns the reserved, but unknown {@link WellKnownMimeType} for this entry. Range is 0-127
   * (inclusive).
   *
   * @return the reserved, but unknown {@link WellKnownMimeType} for this entry
   */
  get type() {
    return this._type;
  }
}
exports.ReservedMimeTypeEntry = ReservedMimeTypeEntry;

class WellKnownMimeTypeEntry {
  constructor(content, type) {
    this._content = content;
    this._type = type;
  }

  get content() {
    return this._content;
  }

  get mimeType() {
    return this._type.string;
  }

  /**
   * Returns the {@link WellKnownMimeType} for this entry.
   *
   * @return the {@link WellKnownMimeType} for this entry
   */
  get type() {
    return this._type;
  }
}

/**
 * Decode a {@code byte} compressed mime id from a {@link ByteBuf}, assuming said buffer properly
 * contains such an id.
 *
 * <p>The buffer must have exactly one readable byte, which is assumed to have been tested for
 * mime id encoding via the {@link #STREAM_METADATA_KNOWN_MASK} mask ({@code firstByte &
 * STREAM_METADATA_KNOWN_MASK) == STREAM_METADATA_KNOWN_MASK}).
 *
 * <p>If there is no readable byte, the negative identifier of {@link
 * WellKnownMimeType#UNPARSEABLE_MIME_TYPE} is returned.
 *
 * @param mimeBuffer the buffer that should next contain the compressed mime id byte
 * @return the compressed mime id, between 0 and 127, or a negative id if the input is invalid
 * @see #decodeMimeTypeFromMimeBuffer(ByteBuf)
 */ exports.WellKnownMimeTypeEntry = WellKnownMimeTypeEntry;
function decodeMimeIdFromMimeBuffer(mimeBuffer) {
  if (!isWellKnownMimeType(mimeBuffer)) {
    return _WellKnownMimeType.UNPARSEABLE_MIME_TYPE.identifier;
  }
  return mimeBuffer.readInt8() & STREAM_METADATA_LENGTH_MASK;
}

function computeNextEntryIndex(currentEntryIndex, headerSlice, contentSlice) {
  return (
    currentEntryIndex +
    headerSlice.byteLength + // this includes the mime length byte
    3 + // 3 bytes of the content length, which are excluded from the slice
    contentSlice.byteLength
  );
}

function isWellKnownMimeType(header) {
  return header.byteLength === 1;
}

const STREAM_METADATA_KNOWN_MASK = 0x80; // 1000 0000
const STREAM_METADATA_LENGTH_MASK = 0x7f; // 0111 1111

function isAscii(buffer, offset) {
  let isAscii = true;
  for (let i = offset, length = buffer.length; i < length; i++) {
    if (buffer[i] > 127) {
      isAscii = false;
      break;
    }
  }

  return isAscii;
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/Invariant.js":
/*!**********************************************************!*\
  !*** ../../node_modules/rsocket-core/build/Invariant.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */


/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments to provide
 * information about what broke and what you were expecting.
 *
 * The invariant message will be stripped in production, but the invariant will
 * remain to ensure logic does not differ in production.
 */
function invariant(condition, format, ...args) {
  if (!condition) {
    let error;

    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified ' +
          'dev environment for the full error message and additional helpful warnings.'
      );
    } else {
      let argIndex = 0;
      error = new Error(format.replace(/%s/g, () => String(args[argIndex++])));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // Skip invariant's own stack frame.

    throw error;
  }
}

module.exports = invariant;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/LiteBuffer.js":
/*!***********************************************************!*\
  !*** ../../node_modules/rsocket-core/build/LiteBuffer.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.LiteBuffer = exports.Buffer = void 0;

var _buffer = _interopRequireDefault(__webpack_require__(/*! buffer */ "?22d6"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const hasGlobalBuffer =
  typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g.hasOwnProperty('Buffer');
const hasBufferModule = _buffer.default.hasOwnProperty('Buffer');

function notImplemented(msg) {
  const message = msg ? `Not implemented: ${msg}` : 'Not implemented';
  throw new Error(message);
}

// eslint-disable-next-line max-len
// Taken from: https://github.com/nodejs/node/blob/ba684805b6c0eded76e5cd89ee00328ac7a59365/lib/internal/util.js#L125
// Return undefined if there is no match.
// Move the "slow cases" to a separate function to make sure this function gets
// inlined properly. That prioritizes the common case.
function normalizeEncoding(enc) {
  if (enc == null || enc === 'utf8' || enc === 'utf-8') {
    return 'utf8';
  }
  return slowCases(enc);
}

function isInstance(obj, type) {
  return (
    obj instanceof type ||
    (obj != null &&
      obj.constructor != null &&
      obj.constructor.name != null &&
      obj.constructor.name === type.name)
  );
}

// eslint-disable-next-line max-len
// https://github.com/nodejs/node/blob/ba684805b6c0eded76e5cd89ee00328ac7a59365/lib/internal/util.js#L130
function slowCases(enc) {
  switch (enc.length) {
    case 4:
      if (enc === 'UTF8') {
        return 'utf8';
      }
      if (enc === 'ucs2' || enc === 'UCS2') {
        return 'utf16le';
      }
      enc = `${enc}`.toLowerCase();
      if (enc === 'utf8') {
        return 'utf8';
      }
      if (enc === 'ucs2') {
        return 'utf16le';
      }
      break;
    case 3:
      if (enc === 'hex' || enc === 'HEX' || `${enc}`.toLowerCase() === 'hex') {
        return 'hex';
      }
      break;
    case 5:
      if (enc === 'ascii') {
        return 'ascii';
      }
      if (enc === 'ucs-2') {
        return 'utf16le';
      }
      if (enc === 'UTF-8') {
        return 'utf8';
      }
      if (enc === 'ASCII') {
        return 'ascii';
      }
      if (enc === 'UCS-2') {
        return 'utf16le';
      }
      enc = `${enc}`.toLowerCase();
      if (enc === 'utf-8') {
        return 'utf8';
      }
      if (enc === 'ascii') {
        return 'ascii';
      }
      if (enc === 'ucs-2') {
        return 'utf16le';
      }
      break;
    case 6:
      if (enc === 'base64') {
        return 'base64';
      }
      if (enc === 'latin1' || enc === 'binary') {
        return 'latin1';
      }
      if (enc === 'BASE64') {
        return 'base64';
      }
      if (enc === 'LATIN1' || enc === 'BINARY') {
        return 'latin1';
      }
      enc = `${enc}`.toLowerCase();
      if (enc === 'base64') {
        return 'base64';
      }
      if (enc === 'latin1' || enc === 'binary') {
        return 'latin1';
      }
      break;
    case 7:
      if (
        enc === 'utf16le' ||
        enc === 'UTF16LE' ||
        `${enc}`.toLowerCase() === 'utf16le'
      ) {
        return 'utf16le';
      }
      break;
    case 8:
      if (
        enc === 'utf-16le' ||
        enc === 'UTF-16LE' ||
        `${enc}`.toLowerCase() === 'utf-16le'
      ) {
        return 'utf16le';
      }
      break;
    default:
      if (enc === '') {
        return 'utf8';
      }
  }
}

const notImplementedEncodings = [
  'base64',
  'hex',
  'ascii',
  'binary',
  'latin1',
  'ucs2',
  'utf16le',
];

function checkEncoding(encoding = 'utf8', strict = true) {
  if (typeof encoding !== 'string' || (strict && encoding === '')) {
    if (!strict) {
      return 'utf8';
    }
    throw new TypeError(`Unknown encoding: ${encoding}`);
  }

  const normalized = normalizeEncoding(encoding);

  if (normalized === undefined) {
    throw new TypeError(`Unknown encoding: ${encoding}`);
  }

  if (notImplementedEncodings.includes(encoding)) {
    notImplemented(`"${encoding}" encoding`);
  }

  return normalized;
}

// https://github.com/nodejs/node/blob/56dbe466fdbc598baea3bfce289bf52b97b8b8f7/lib/buffer.js#L598
const encodingOps = {
  ascii: {
    byteLength: (string) => string.length,
  },

  base64: {
    byteLength: (string) => base64ByteLength(string, string.length),
  },

  hex: {
    byteLength: (string) => string.length >>> 1,
  },

  latin1: {
    byteLength: (string) => string.length,
  },

  ucs2: {
    byteLength: (string) => string.length * 2,
  },

  utf16le: {
    byteLength: (string) => string.length * 2,
  },

  utf8: {
    byteLength: (string) => utf8ToBytes(string).length,
  },
};

function base64ByteLength(str, bytes) {
  // Handle padding
  if (str.charCodeAt(bytes - 1) === 0x3d) {
    bytes--;
  }
  if (bytes > 1 && str.charCodeAt(bytes - 1) === 0x3d) {
    bytes--;
  }

  // Base64 ratio: 3/4
  // eslint-disable-next-line no-bitwise
  return (bytes * 3) >>> 2;
}

const MAX_ARGUMENTS_LENGTH = 0x1000;
function decodeCodePointsArray(codePoints) {
  const len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  let res = '';
  let i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
    );
  }
  return res;
}

function utf8ToBytes(str, pUnits = Infinity) {
  let units = pUnits;
  let codePoint;
  const length = str.length;
  let leadSurrogate = null;
  const bytes = [];

  for (let i = 0; i < length; ++i) {
    codePoint = str.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xd7ff && codePoint < 0xe000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xdbff) {
          // unexpected trail
          if ((units -= 3) > -1) {
            bytes.push(0xef, 0xbf, 0xbd);
          }
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) {
            bytes.push(0xef, 0xbf, 0xbd);
          }
          continue;
        }

        // valid lead
        leadSurrogate = codePoint;

        continue;
      }

      // 2 leads in a row
      if (codePoint < 0xdc00) {
        if ((units -= 3) > -1) {
          bytes.push(0xef, 0xbf, 0xbd);
        }
        leadSurrogate = codePoint;
        continue;
      }

      // valid surrogate pair
      codePoint =
        (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) {
        bytes.push(0xef, 0xbf, 0xbd);
      }
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) {
        break;
      }
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) {
        break;
      }
      bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) {
        break;
      }
      bytes.push(
        (codePoint >> 0xc) | 0xe0,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) {
        break;
      }
      bytes.push(
        (codePoint >> 0x12) | 0xf0,
        ((codePoint >> 0xc) & 0x3f) | 0x80,
        ((codePoint >> 0x6) & 0x3f) | 0x80,
        (codePoint & 0x3f) | 0x80
      );
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  const res = [];

  let i = start;
  while (i < end) {
    const firstByte = buf[i];
    let codePoint = null;
    let bytesPerSequence =
      firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xc0) === 0x80) {
            tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
            if (tempCodePoint > 0x7f) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
            tempCodePoint =
              ((firstByte & 0xf) << 0xc) |
              ((secondByte & 0x3f) << 0x6) |
              (thirdByte & 0x3f);
            if (
              tempCodePoint > 0x7ff &&
              (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
            ) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if (
            (secondByte & 0xc0) === 0x80 &&
            (thirdByte & 0xc0) === 0x80 &&
            (fourthByte & 0xc0) === 0x80
          ) {
            tempCodePoint =
              ((firstByte & 0xf) << 0x12) |
              ((secondByte & 0x3f) << 0xc) |
              ((thirdByte & 0x3f) << 0x6) |
              (fourthByte & 0x3f);
            if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xfffd;
      bytesPerSequence = 1;
    } else if (codePoint > 0xffff) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
      codePoint = 0xdc00 | (codePoint & 0x3ff);
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

function utf8Write(buf, input, offset, length) {
  return blitBuffer(
    utf8ToBytes(input, buf.length - offset),
    buf,
    offset,
    length
  );
}

function blitBuffer(src, dst, offset, length) {
  let i = 0;
  for (; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) {
      break;
    }
    dst[i + offset] = src[i];
  }
  return i;
}

/**
 * See also https://nodejs.org/api/buffer.html
 */
class Buffer extends Uint8Array {
  constructor(value, byteOffset, length) {
    if (typeof value == 'number') {
      super(value);
    } else {
      const offset = byteOffset || 0;
      const realLength =
        //$FlowFixMe
        length || (isInstance(value, Array) ? value.length : value.byteLength);
      super(value, offset, realLength);
    }
  }
  /**
   * Allocates a new Buffer of size bytes.
   */
  static alloc(size, fill = 0, encoding = 'utf8') {
    if (typeof size !== 'number') {
      throw new TypeError(
        `The "size" argument must be of type number. Received type ${typeof size}`
      );
    }

    const buf = new Buffer(size);
    if (size === 0) {
      return buf;
    }

    let bufFill;
    if (typeof fill === 'string') {
      encoding = checkEncoding(encoding);
      if (fill.length === 1 && encoding === 'utf8') {
        buf.fill(fill.charCodeAt(0));
      } else {
        bufFill = Buffer.from(fill, encoding);
      }
    } else if (typeof fill === 'number') {
      buf.fill(fill);
    } else if (isInstance(fill, Uint8Array)) {
      if (fill.length === 0) {
        throw new TypeError(
          `The argument "value" is invalid. Received ${fill.constructor.name} []`
        );
      }

      bufFill = fill;
    }

    if (bufFill) {
      if (bufFill.length > buf.length) {
        bufFill = bufFill.subarray(0, buf.length);
      }

      let offset = 0;
      while (offset < size) {
        buf.set(bufFill, offset);
        offset += bufFill.length;
        if (offset + bufFill.length >= size) {
          break;
        }
      }
      if (offset !== size) {
        buf.set(bufFill.subarray(0, size - offset), offset);
      }
    }

    return buf;
  }

  static allocUnsafe(size) {
    return new Buffer(size);
  }

  /**
   * Returns the byte length of a string when encoded. This is not the same as
   * String.prototype.length, which does not account for the encoding that is
   * used to convert the string into bytes.
   */
  static byteLength(string, encoding = 'utf8') {
    if (typeof string != 'string') {
      return string.byteLength;
    }

    encoding = normalizeEncoding(encoding) || 'utf8';
    return encodingOps[encoding].byteLength(string);
  }

  /**
   * Returns a new Buffer which is the result of concatenating all the Buffer
   * instances in the list together.
   */
  static concat(list, totalLength) {
    if (totalLength == undefined) {
      totalLength = 0;
      for (const buf of list) {
        totalLength += buf.length;
      }
    }

    const buffer = new Buffer(totalLength);
    let pos = 0;
    for (const buf of list) {
      buffer.set(buf, pos);
      pos += buf.length;
    }

    return buffer;
  }

  /**
   * This creates a view of the ArrayBuffer without copying the underlying
   * memory. For example, when passed a reference to the .buffer property of a
   * TypedArray instance, the newly created Buffer will share the same allocated
   * memory as the TypedArray.
   */
  //$FlowFixMe
  static from(
    value,
    byteOffsetOrEncoding,
    //$FlowFixMe
    length
  ) {
    const offset =
      typeof byteOffsetOrEncoding === 'string'
        ? undefined
        : byteOffsetOrEncoding;
    let encoding =
      typeof byteOffsetOrEncoding === 'string'
        ? byteOffsetOrEncoding
        : undefined;

    if (typeof value === 'string' || value.constructor.name === 'String') {
      value = value.toString();
      encoding = checkEncoding(encoding, false);
      // if (encoding === 'hex') {return new Buffer(hex.decodeString(value).buffer);}
      // if (encoding === 'base64') {return new Buffer(base64.decode(value));}

      switch (encoding) {
        case 'utf8':
          if (typeof TextEncoder !== 'undefined') {
            return new Buffer(new TextEncoder().encode(value).buffer);
          }
          return new Buffer(utf8ToBytes(value));
        default:
          throw new TypeError('Unknown encoding: ' + encoding);
      }
    }

    // workaround for https://github.com/microsoft/TypeScript/issues/38446
    return new Buffer(value, offset, length);
  }

  /**
   * Returns true if obj is a Buffer, false otherwise.
   */
  static isBuffer(obj) {
    return (
      isInstance(obj, Buffer) ||
      (!hasGlobalBuffer && hasBufferModule && isInstance(obj, Uint8Array))
    );
  }

  static isEncoding(encoding) {
    return (
      typeof encoding === 'string' &&
      encoding.length !== 0 &&
      normalizeEncoding(encoding) !== undefined
    );
  }

  /**
   * Copies data from a region of buf to a region in target, even if the target
   * memory region overlaps with buf.
   */
  copy(
    targetBuffer,
    targetStart = 0,
    sourceStart = 0,
    sourceEnd = this.length
  ) {
    const sourceBuffer = this.subarray(sourceStart, sourceEnd);
    targetBuffer.set(sourceBuffer, targetStart);
    return sourceBuffer.length;
  }

  /*
   * Returns true if both buf and otherBuffer have exactly the same bytes, false otherwise.
   */
  equals(otherBuffer) {
    if (!isInstance(otherBuffer, Uint8Array)) {
      throw new TypeError(
        // eslint-disable-next-line max-len
        `The "otherBuffer" argument must be an instance of Buffer or Uint8Array. Received type ${typeof otherBuffer}`
      );
    }

    if (this === otherBuffer) {
      return true;
    }
    if (this.byteLength !== otherBuffer.byteLength) {
      return false;
    }

    for (let i = 0; i < this.length; i++) {
      if (this[i] !== otherBuffer[i]) {
        return false;
      }
    }

    return true;
  }

  readDoubleBE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getFloat64(offset);
  }

  readDoubleLE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getFloat64(offset, true);
  }

  readFloatBE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getFloat32(offset);
  }

  readFloatLE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getFloat32(offset, true);
  }

  readInt8(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt8(
      offset
    );
  }

  readInt16BE(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt16(
      offset
    );
  }

  readInt16LE(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt16(
      offset,
      true
    );
  }

  readInt32BE(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt32(
      offset
    );
  }

  readInt32LE(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getInt32(
      offset,
      true
    );
  }

  readUInt8(offset = 0) {
    return new DataView(this.buffer, this.byteOffset, this.byteLength).getUint8(
      offset
    );
  }

  readUInt16BE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getUint16(offset);
  }

  readUInt16LE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getUint16(offset, true);
  }

  readUInt32BE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getUint32(offset);
  }

  readUInt32LE(offset = 0) {
    return new DataView(
      this.buffer,
      this.byteOffset,
      this.byteLength
    ).getUint32(offset, true);
  }

  /**
   * Returns a new Buffer that references the same memory as the original, but
   * offset and cropped by the start and end indices.
   */
  // $FlowFixMe
  slice(begin = 0, end = this.length) {
    // workaround for https://github.com/microsoft/TypeScript/issues/38665
    return this.subarray(begin, end);
  }

  // $FlowFixMe
  subarray(begin = 0, end = this.length) {
    return new Buffer(super.subarray(begin, end));
  }

  /**
   * Returns a JSON representation of buf. JSON.stringify() implicitly calls
   * this function when stringifying a Buffer instance.
   */
  toJSON() {
    return {data: Array.from(this), type: 'Buffer'};
  }

  /**
   * Decodes buf to a string according to the specified character encoding in
   * encoding. start and end may be passed to decode only a subset of buf.
   */
  toString(encoding = 'utf8', start = 0, end = this.length) {
    encoding = checkEncoding(encoding);

    if (typeof TextDecoder !== 'undefined') {
      const b = this.subarray(start, end);
      // if (encoding === 'hex') {return hex.encodeToString(b);}
      // if (encoding === 'base64') {return base64.encode(b.buffer);}

      return new TextDecoder().decode(b);
    }

    return this.slowToString(encoding, start, end);
  }

  slowToString(encoding = 'utf8', start = 0, end = this.length) {
    if (start === undefined || start < 0) {
      start = 0;
    }

    if (start > this.length) {
      return '';
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return '';
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return '';
    }

    encoding = checkEncoding(encoding);
    switch (encoding) {
      case 'utf8':
        return utf8Slice(this, start, end);
      default:
        throw new TypeError('Unsupported encoding: ' + encoding);
    }
  }

  /**
   * Writes string to buf at offset according to the character encoding in
   * encoding. The length parameter is the number of bytes to write. If buf did
   * not contain enough space to fit the entire string, only part of string will
   * be written. However, partially encoded characters will not be written.
   */
  write(string, offset = 0, length = this.length, encoding = 'utf8') {
    encoding = checkEncoding(encoding);
    switch (encoding) {
      case 'utf8':
        if (typeof TextEncoder !== 'undefined') {
          // $FlowFixMe
          const resultArray = new TextEncoder().encode(string);
          this.set(resultArray, offset);

          return resultArray.byteLength > length - offset
            ? length - offset
            : resultArray.byteLength;
        }
        return utf8Write(this, string, offset, length);
      default:
        throw new TypeError('Unknown encoding: ' + encoding);
    }
  }

  writeDoubleBE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat64(
      offset,
      value
    );

    return offset + 8;
  }

  writeDoubleLE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat64(
      offset,
      value,
      true
    );

    return offset + 8;
  }

  writeFloatBE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat32(
      offset,
      value
    );

    return offset + 4;
  }

  writeFloatLE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setFloat32(
      offset,
      value,
      true
    );

    return offset + 4;
  }

  writeInt8(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setInt8(
      offset,
      value
    );

    return offset + 1;
  }

  writeInt16BE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setInt16(
      offset,
      value
    );

    return offset + 2;
  }

  writeInt16LE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setInt16(
      offset,
      value,
      true
    );

    return offset + 2;
  }

  writeInt32BE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(
      offset,
      value
    );

    return offset + 4;
  }

  writeInt32LE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setInt32(
      offset,
      value,
      true
    );

    return offset + 4;
  }

  writeUInt8(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint8(
      offset,
      value
    );

    return offset + 1;
  }

  writeUInt16BE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint16(
      offset,
      value
    );

    return offset + 2;
  }

  writeUInt16LE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint16(
      offset,
      value,
      true
    );

    return offset + 2;
  }

  writeUInt32BE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(
      offset,
      value
    );

    return offset + 4;
  }

  writeUInt32LE(value, offset = 0) {
    new DataView(this.buffer, this.byteOffset, this.byteLength).setUint32(
      offset,
      value,
      true
    );

    return offset + 4;
  }
}
exports.Buffer = Buffer;

if (!hasGlobalBuffer) {
  if (hasBufferModule) {
    // ExistingBuffer is likely to be a polyfill, hence we can override it
    // eslint-disable-next-line no-undef
    // $FlowFixMe
    Object.defineProperty(_buffer.default, 'Buffer', {
      configurable: true,
      enumerable: false,
      value: Buffer,
      writable: true,
    });
  }
  // eslint-disable-next-line no-undef
  Object.defineProperty(window, 'Buffer', {
    configurable: true,
    enumerable: false,
    value: Buffer,
    writable: true,
  });
}

const LiteBuffer = hasGlobalBuffer ? __webpack_require__.g.Buffer : Buffer;
exports.LiteBuffer = LiteBuffer;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketBinaryFraming.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketBinaryFraming.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */



/* eslint-disable consistent-return, no-bitwise */ Object.defineProperty(exports, "__esModule", ({value: true}));
exports.deserializeFrameWithLength = deserializeFrameWithLength;
exports.deserializeFrames = deserializeFrames;
exports.serializeFrameWithLength = serializeFrameWithLength;
exports.deserializeFrame = deserializeFrame;
exports.serializeFrame = serializeFrame;
exports.sizeOfFrame = sizeOfFrame;

var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");

var _RSocketEncoding = __webpack_require__(/*! ./RSocketEncoding */ "../../node_modules/rsocket-core/build/RSocketEncoding.js");
var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Frame header is:
 * - stream id (uint32 = 4)
 * - type + flags (uint 16 = 2)
 */
const FRAME_HEADER_SIZE = 6;

/**
 * Size of frame length and metadata length fields.
 */
const UINT24_SIZE = 3;

/**
 * Reads a frame from a buffer that is prefixed with the frame length.
 */
function deserializeFrameWithLength(buffer, encoders) {
  const frameLength = (0, _RSocketBufferUtils.readUInt24BE)(buffer, 0);
  return deserializeFrame(
    buffer.slice(UINT24_SIZE, UINT24_SIZE + frameLength),
    encoders
  );
}

/**
 * Given a buffer that may contain zero or more length-prefixed frames followed
 * by zero or more bytes of a (partial) subsequent frame, returns an array of
 * the frames and a buffer of the leftover bytes.
 */
function deserializeFrames(buffer, encoders) {
  const frames = [];
  let offset = 0;
  while (offset + UINT24_SIZE < buffer.length) {
    const frameLength = (0, _RSocketBufferUtils.readUInt24BE)(buffer, offset);
    const frameStart = offset + UINT24_SIZE;
    const frameEnd = frameStart + frameLength;
    if (frameEnd > buffer.length) {
      // not all bytes of next frame received
      break;
    }
    const frameBuffer = buffer.slice(frameStart, frameEnd);
    const frame = deserializeFrame(frameBuffer, encoders);
    frames.push(frame);
    offset = frameEnd;
  }
  return [frames, buffer.slice(offset, buffer.length)];
}

/**
 * Writes a frame to a buffer with a length prefix.
 */
function serializeFrameWithLength(frame, encoders) {
  const buffer = serializeFrame(frame, encoders);
  const lengthPrefixed = (0, _RSocketBufferUtils.createBuffer)(
    buffer.length + UINT24_SIZE
  );
  (0, _RSocketBufferUtils.writeUInt24BE)(lengthPrefixed, buffer.length, 0);
  buffer.copy(lengthPrefixed, UINT24_SIZE, 0, buffer.length);
  return lengthPrefixed;
}

/**
 * Read a frame from the buffer.
 */
function deserializeFrame(buffer, encoders) {
  encoders = encoders || _RSocketEncoding.Utf8Encoders;
  let offset = 0;
  const streamId = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    streamId >= 0,
    'RSocketBinaryFraming: Invalid frame, expected a positive stream id, got `%s.',
    streamId
  );

  const typeAndFlags = buffer.readUInt16BE(offset);
  offset += 2;
  const type = typeAndFlags >>> _RSocketFrame.FRAME_TYPE_OFFFSET; // keep highest 6 bits
  const flags = typeAndFlags & _RSocketFrame.FLAGS_MASK; // keep lowest 10 bits
  switch (type) {
    case _RSocketFrame.FRAME_TYPES.SETUP:
      return deserializeSetupFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.PAYLOAD:
      return deserializePayloadFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.ERROR:
      return deserializeErrorFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.KEEPALIVE:
      return deserializeKeepAliveFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
      return deserializeRequestFnfFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      return deserializeRequestResponseFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
      return deserializeRequestStreamFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
      return deserializeRequestChannelFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.METADATA_PUSH:
      return deserializeMetadataPushFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_N:
      return deserializeRequestNFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME:
      return deserializeResumeFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME_OK:
      return deserializeResumeOkFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.CANCEL:
      return deserializeCancelFrame(buffer, streamId, flags, encoders);
    case _RSocketFrame.FRAME_TYPES.LEASE:
      return deserializeLeaseFrame(buffer, streamId, flags, encoders);
    default:
      (0, _Invariant.default)(
        false,
        'RSocketBinaryFraming: Unsupported frame type `%s`.',
        (0, _RSocketFrame.getFrameTypeName)(type)
      );
  }
}

/**
 * Convert the frame to a (binary) buffer.
 */
function serializeFrame(frame, encoders) {
  encoders = encoders || _RSocketEncoding.Utf8Encoders;
  switch (frame.type) {
    case _RSocketFrame.FRAME_TYPES.SETUP:
      return serializeSetupFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.PAYLOAD:
      return serializePayloadFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.ERROR:
      return serializeErrorFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.KEEPALIVE:
      return serializeKeepAliveFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
    case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      return serializeRequestFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
    case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
      return serializeRequestManyFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.METADATA_PUSH:
      return serializeMetadataPushFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_N:
      return serializeRequestNFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME:
      return serializeResumeFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME_OK:
      return serializeResumeOkFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.CANCEL:
      return serializeCancelFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.LEASE:
      return serializeLeaseFrame(frame, encoders);
    default:
      (0, _Invariant.default)(
        false,
        'RSocketBinaryFraming: Unsupported frame type `%s`.',
        (0, _RSocketFrame.getFrameTypeName)(frame.type)
      );
  }
}
/**
 * Byte size of frame without size prefix
 */
function sizeOfFrame(frame, encoders) {
  encoders = encoders || _RSocketEncoding.Utf8Encoders;
  switch (frame.type) {
    case _RSocketFrame.FRAME_TYPES.SETUP:
      return sizeOfSetupFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.PAYLOAD:
      return sizeOfPayloadFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.ERROR:
      return sizeOfErrorFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.KEEPALIVE:
      return sizeOfKeepAliveFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
    case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      return sizeOfRequestFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
    case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
      return sizeOfRequestManyFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.METADATA_PUSH:
      return sizeOfMetadataPushFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.REQUEST_N:
      return sizeOfRequestNFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME:
      return sizeOfResumeFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.RESUME_OK:
      return sizeOfResumeOkFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.CANCEL:
      return sizeOfCancelFrame(frame, encoders);
    case _RSocketFrame.FRAME_TYPES.LEASE:
      return sizeOfLeaseFrame(frame, encoders);
    default:
      (0, _Invariant.default)(
        false,
        'RSocketBinaryFraming: Unsupported frame type `%s`.',
        (0, _RSocketFrame.getFrameTypeName)(frame.type)
      );
  }
}

/**
 * Writes a SETUP frame into a new buffer and returns it.
 *
 * Prefix size is:
 * - version (2x uint16 = 4)
 * - keepalive (uint32 = 4)
 * - lifetime (uint32 = 4)
 * - mime lengths (2x uint8 = 2)
 */
const SETUP_FIXED_SIZE = 14;
const RESUME_TOKEN_LENGTH_SIZE = 2;
function serializeSetupFrame(frame, encoders) {
  const resumeTokenLength =
    frame.resumeToken != null
      ? encoders.resumeToken.byteLength(frame.resumeToken)
      : 0;
  const metadataMimeTypeLength =
    frame.metadataMimeType != null
      ? encoders.metadataMimeType.byteLength(frame.metadataMimeType)
      : 0;
  const dataMimeTypeLength =
    frame.dataMimeType != null
      ? encoders.dataMimeType.byteLength(frame.dataMimeType)
      : 0;
  const payloadLength = getPayloadLength(frame, encoders);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE +
      SETUP_FIXED_SIZE + //
      (resumeTokenLength ? RESUME_TOKEN_LENGTH_SIZE + resumeTokenLength : 0) +
      metadataMimeTypeLength +
      dataMimeTypeLength +
      payloadLength
  );

  let offset = writeHeader(frame, buffer);
  offset = buffer.writeUInt16BE(frame.majorVersion, offset);
  offset = buffer.writeUInt16BE(frame.minorVersion, offset);
  offset = buffer.writeUInt32BE(frame.keepAlive, offset);
  offset = buffer.writeUInt32BE(frame.lifetime, offset);

  if (frame.flags & _RSocketFrame.FLAGS.RESUME_ENABLE) {
    offset = buffer.writeUInt16BE(resumeTokenLength, offset);
    if (frame.resumeToken != null) {
      offset = encoders.resumeToken.encode(
        frame.resumeToken,
        buffer,
        offset,
        offset + resumeTokenLength
      );
    }
  }

  offset = buffer.writeUInt8(metadataMimeTypeLength, offset);
  if (frame.metadataMimeType != null) {
    offset = encoders.metadataMimeType.encode(
      frame.metadataMimeType,
      buffer,
      offset,
      offset + metadataMimeTypeLength
    );
  }

  offset = buffer.writeUInt8(dataMimeTypeLength, offset);
  if (frame.dataMimeType != null) {
    offset = encoders.dataMimeType.encode(
      frame.dataMimeType,
      buffer,
      offset,
      offset + dataMimeTypeLength
    );
  }

  writePayload(frame, buffer, encoders, offset);
  return buffer;
}

function sizeOfSetupFrame(frame, encoders) {
  const resumeTokenLength =
    frame.resumeToken != null
      ? encoders.resumeToken.byteLength(frame.resumeToken)
      : 0;
  const metadataMimeTypeLength =
    frame.metadataMimeType != null
      ? encoders.metadataMimeType.byteLength(frame.metadataMimeType)
      : 0;
  const dataMimeTypeLength =
    frame.dataMimeType != null
      ? encoders.dataMimeType.byteLength(frame.dataMimeType)
      : 0;
  const payloadLength = getPayloadLength(frame, encoders);
  return (
    FRAME_HEADER_SIZE +
    SETUP_FIXED_SIZE + //
    (resumeTokenLength ? RESUME_TOKEN_LENGTH_SIZE + resumeTokenLength : 0) +
    metadataMimeTypeLength +
    dataMimeTypeLength +
    payloadLength
  );
}

/**
 * Reads a SETUP frame from the buffer and returns it.
 */
function deserializeSetupFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid SETUP frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const majorVersion = buffer.readUInt16BE(offset);
  offset += 2;
  const minorVersion = buffer.readUInt16BE(offset);
  offset += 2;

  const keepAlive = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    keepAlive >= 0 && keepAlive <= _RSocketFrame.MAX_KEEPALIVE,
    'RSocketBinaryFraming: Invalid SETUP frame, expected keepAlive to be ' +
      '>= 0 and <= %s. Got `%s`.',
    _RSocketFrame.MAX_KEEPALIVE,
    keepAlive
  );

  const lifetime = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    lifetime >= 0 && lifetime <= _RSocketFrame.MAX_LIFETIME,
    'RSocketBinaryFraming: Invalid SETUP frame, expected lifetime to be ' +
      '>= 0 and <= %s. Got `%s`.',
    _RSocketFrame.MAX_LIFETIME,
    lifetime
  );

  let resumeToken = null;
  if (flags & _RSocketFrame.FLAGS.RESUME_ENABLE) {
    const resumeTokenLength = buffer.readInt16BE(offset);
    offset += 2;
    (0, _Invariant.default)(
      resumeTokenLength >= 0 &&
        resumeTokenLength <= _RSocketFrame.MAX_RESUME_LENGTH,
      'RSocketBinaryFraming: Invalid SETUP frame, expected resumeToken length ' +
        'to be >= 0 and <= %s. Got `%s`.',
      _RSocketFrame.MAX_RESUME_LENGTH,
      resumeTokenLength
    );

    resumeToken = encoders.resumeToken.decode(
      buffer,
      offset,
      offset + resumeTokenLength
    );

    offset += resumeTokenLength;
  }

  const metadataMimeTypeLength = buffer.readUInt8(offset);
  offset += 1;
  const metadataMimeType = encoders.metadataMimeType.decode(
    buffer,
    offset,
    offset + metadataMimeTypeLength
  );

  offset += metadataMimeTypeLength;

  const dataMimeTypeLength = buffer.readUInt8(offset);
  offset += 1;
  const dataMimeType = encoders.dataMimeType.decode(
    buffer,
    offset,
    offset + dataMimeTypeLength
  );

  offset += dataMimeTypeLength;

  const frame = {
    data: null,
    dataMimeType,
    flags,
    keepAlive,
    length,
    lifetime,
    majorVersion,
    metadata: null,
    metadataMimeType,
    minorVersion,
    resumeToken,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.SETUP,
  };

  readPayload(buffer, frame, encoders, offset);
  return frame;
}

/**
 * Writes an ERROR frame into a new buffer and returns it.
 *
 * Prefix size is for the error code (uint32 = 4).
 */
const ERROR_FIXED_SIZE = 4;
function serializeErrorFrame(frame, encoders) {
  const messageLength =
    frame.message != null ? encoders.message.byteLength(frame.message) : 0;
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + ERROR_FIXED_SIZE + messageLength
  );

  let offset = writeHeader(frame, buffer);
  offset = buffer.writeUInt32BE(frame.code, offset);
  if (frame.message != null) {
    encoders.message.encode(
      frame.message,
      buffer,
      offset,
      offset + messageLength
    );
  }
  return buffer;
}

function sizeOfErrorFrame(frame, encoders) {
  const messageLength =
    frame.message != null ? encoders.message.byteLength(frame.message) : 0;
  return FRAME_HEADER_SIZE + ERROR_FIXED_SIZE + messageLength;
}

/**
 * Reads an ERROR frame from the buffer and returns it.
 */
function deserializeErrorFrame(buffer, streamId, flags, encoders) {
  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const code = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    code >= 0 && code <= _RSocketFrame.MAX_CODE,
    'RSocketBinaryFraming: Invalid ERROR frame, expected code to be >= 0 and <= %s. Got `%s`.',
    _RSocketFrame.MAX_CODE,
    code
  );

  const messageLength = buffer.length - offset;
  let message = '';
  if (messageLength > 0) {
    message = encoders.message.decode(buffer, offset, offset + messageLength);
    offset += messageLength;
  }

  return {
    code,
    flags,
    length,
    message,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.ERROR,
  };
}

/**
 * Writes a KEEPALIVE frame into a new buffer and returns it.
 *
 * Prefix size is for the last received position (uint64 = 8).
 */
const KEEPALIVE_FIXED_SIZE = 8;
function serializeKeepAliveFrame(frame, encoders) {
  const dataLength =
    frame.data != null ? encoders.data.byteLength(frame.data) : 0;
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + KEEPALIVE_FIXED_SIZE + dataLength
  );

  let offset = writeHeader(frame, buffer);
  offset = (0, _RSocketBufferUtils.writeUInt64BE)(
    buffer,
    frame.lastReceivedPosition,
    offset
  );
  if (frame.data != null) {
    encoders.data.encode(frame.data, buffer, offset, offset + dataLength);
  }
  return buffer;
}

function sizeOfKeepAliveFrame(frame, encoders) {
  const dataLength =
    frame.data != null ? encoders.data.byteLength(frame.data) : 0;
  return FRAME_HEADER_SIZE + KEEPALIVE_FIXED_SIZE + dataLength;
}

/**
 * Reads a KEEPALIVE frame from the buffer and returns it.
 */
function deserializeKeepAliveFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid KEEPALIVE frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const lastReceivedPosition = (0, _RSocketBufferUtils.readUInt64BE)(
    buffer,
    offset
  );
  offset += 8;
  let data = null;
  if (offset < buffer.length) {
    data = encoders.data.decode(buffer, offset, buffer.length);
  }

  return {
    data,
    flags,
    lastReceivedPosition,
    length,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.KEEPALIVE,
  };
}

/**
 * Writes a LEASE frame into a new buffer and returns it.
 *
 * Prefix size is for the ttl (uint32) and requestcount (uint32).
 */
const LEASE_FIXED_SIZE = 8;
function serializeLeaseFrame(frame, encoders) {
  const metaLength =
    frame.metadata != null ? encoders.metadata.byteLength(frame.metadata) : 0;
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + LEASE_FIXED_SIZE + metaLength
  );

  let offset = writeHeader(frame, buffer);
  offset = buffer.writeUInt32BE(frame.ttl, offset);
  offset = buffer.writeUInt32BE(frame.requestCount, offset);
  if (frame.metadata != null) {
    encoders.metadata.encode(
      frame.metadata,
      buffer,
      offset,
      offset + metaLength
    );
  }
  return buffer;
}

function sizeOfLeaseFrame(frame, encoders) {
  const metaLength =
    frame.metadata != null ? encoders.metadata.byteLength(frame.metadata) : 0;
  return FRAME_HEADER_SIZE + LEASE_FIXED_SIZE + metaLength;
}

/**
 * Reads a LEASE frame from the buffer and returns it.
 */
function deserializeLeaseFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid LEASE frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const ttl = buffer.readUInt32BE(offset);
  offset += 4;
  const requestCount = buffer.readUInt32BE(offset);
  offset += 4;
  let metadata = null;
  if (offset < buffer.length) {
    metadata = encoders.metadata.decode(buffer, offset, buffer.length);
  }
  return {
    flags,
    length,
    metadata,
    requestCount,
    streamId,
    ttl,
    type: _RSocketFrame.FRAME_TYPES.LEASE,
  };
}

/**
 * Writes a REQUEST_FNF or REQUEST_RESPONSE frame to a new buffer and returns
 * it.
 *
 * Note that these frames have the same shape and only differ in their type.
 */
function serializeRequestFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + payloadLength
  );
  const offset = writeHeader(frame, buffer);
  writePayload(frame, buffer, encoders, offset);
  return buffer;
}

function sizeOfRequestFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  return FRAME_HEADER_SIZE + payloadLength;
}

/**
 * Writes a METADATA_PUSH frame to a new buffer and returns
 * it.
 */
function serializeMetadataPushFrame(frame, encoders) {
  const metadata = frame.metadata;
  if (metadata != null) {
    const buffer = (0, _RSocketBufferUtils.createBuffer)(
      FRAME_HEADER_SIZE + encoders.metadata.byteLength(metadata)
    );

    const offset = writeHeader(frame, buffer);
    encoders.metadata.encode(metadata, buffer, offset, buffer.length);
    return buffer;
  } else {
    const buffer = (0, _RSocketBufferUtils.createBuffer)(FRAME_HEADER_SIZE);
    writeHeader(frame, buffer);
    return buffer;
  }
}

function sizeOfMetadataPushFrame(frame, encoders) {
  return (
    FRAME_HEADER_SIZE +
    (frame.metadata != null ? encoders.metadata.byteLength(frame.metadata) : 0)
  );
}

function deserializeRequestFnfFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid REQUEST_FNF frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  const frame = {
    data: null,
    flags,
    length,
    metadata: null,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.REQUEST_FNF,
  };

  readPayload(buffer, frame, encoders, FRAME_HEADER_SIZE);
  return frame;
}

function deserializeRequestResponseFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid REQUEST_RESPONSE frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  const frame = {
    data: null,
    flags,
    length,
    metadata: null,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE,
  };

  readPayload(buffer, frame, encoders, FRAME_HEADER_SIZE);
  return frame;
}

function deserializeMetadataPushFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid METADATA_PUSH frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  return {
    flags,
    length,
    metadata:
      length === FRAME_HEADER_SIZE
        ? null
        : encoders.metadata.decode(buffer, FRAME_HEADER_SIZE, length),
    streamId,
    type: _RSocketFrame.FRAME_TYPES.METADATA_PUSH,
  };
}

/**
 * Writes a REQUEST_STREAM or REQUEST_CHANNEL frame to a new buffer and returns
 * it.
 *
 * Note that these frames have the same shape and only differ in their type.
 *
 * Prefix size is for requestN (uint32 = 4).
 */
const REQUEST_MANY_HEADER = 4;
function serializeRequestManyFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + REQUEST_MANY_HEADER + payloadLength
  );

  let offset = writeHeader(frame, buffer);
  offset = buffer.writeUInt32BE(frame.requestN, offset);
  writePayload(frame, buffer, encoders, offset);
  return buffer;
}

function sizeOfRequestManyFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  return FRAME_HEADER_SIZE + REQUEST_MANY_HEADER + payloadLength;
}

function deserializeRequestStreamFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid REQUEST_STREAM frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const requestN = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    requestN > 0,
    'RSocketBinaryFraming: Invalid REQUEST_STREAM frame, expected requestN to be > 0, got `%s`.',
    requestN
  );

  const frame = {
    data: null,
    flags,
    length,
    metadata: null,
    requestN,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.REQUEST_STREAM,
  };

  readPayload(buffer, frame, encoders, offset);
  return frame;
}

function deserializeRequestChannelFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid REQUEST_CHANNEL frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const requestN = buffer.readInt32BE(offset);
  offset += 4;
  (0, _Invariant.default)(
    requestN > 0,
    'RSocketBinaryFraming: Invalid REQUEST_STREAM frame, expected requestN to be > 0, got `%s`.',
    requestN
  );

  const frame = {
    data: null,
    flags,
    length,
    metadata: null,
    requestN,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL,
  };

  readPayload(buffer, frame, encoders, offset);
  return frame;
}

/**
 * Writes a REQUEST_N frame to a new buffer and returns it.
 *
 * Prefix size is for requestN (uint32 = 4).
 */
const REQUEST_N_HEADER = 4;
function serializeRequestNFrame(frame, encoders) {
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + REQUEST_N_HEADER
  );
  const offset = writeHeader(frame, buffer);
  buffer.writeUInt32BE(frame.requestN, offset);
  return buffer;
}

function sizeOfRequestNFrame(frame, encoders) {
  return FRAME_HEADER_SIZE + REQUEST_N_HEADER;
}

function deserializeRequestNFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid REQUEST_N frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  const requestN = buffer.readInt32BE(FRAME_HEADER_SIZE);
  (0, _Invariant.default)(
    requestN > 0,
    'RSocketBinaryFraming: Invalid REQUEST_STREAM frame, expected requestN to be > 0, got `%s`.',
    requestN
  );

  return {
    flags,
    length,
    requestN,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
  };
}

/**
 * Writes a CANCEL frame to a new buffer and returns it.
 */
function serializeCancelFrame(frame, encoders) {
  const buffer = (0, _RSocketBufferUtils.createBuffer)(FRAME_HEADER_SIZE);
  writeHeader(frame, buffer);
  return buffer;
}

function sizeOfCancelFrame(frame, encoders) {
  return FRAME_HEADER_SIZE;
}

function deserializeCancelFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid CANCEL frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  return {
    flags,
    length,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.CANCEL,
  };
}

/**
 * Writes a PAYLOAD frame to a new buffer and returns it.
 */
function serializePayloadFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + payloadLength
  );
  const offset = writeHeader(frame, buffer);
  writePayload(frame, buffer, encoders, offset);
  return buffer;
}

function sizeOfPayloadFrame(frame, encoders) {
  const payloadLength = getPayloadLength(frame, encoders);
  return FRAME_HEADER_SIZE + payloadLength;
}

function deserializePayloadFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId > 0,
    'RSocketBinaryFraming: Invalid PAYLOAD frame, expected stream id to be > 0.'
  );

  const length = buffer.length;
  const frame = {
    data: null,
    flags,
    length,
    metadata: null,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
  };

  readPayload(buffer, frame, encoders, FRAME_HEADER_SIZE);
  return frame;
}

/**
 * Writes a RESUME frame into a new buffer and returns it.
 *
 * Fixed size is:
 * - major version (uint16 = 2)
 * - minor version (uint16 = 2)
 * - token length (uint16 = 2)
 * - client position (uint64 = 8)
 * - server position (uint64 = 8)
 */
const RESUME_FIXED_SIZE = 22;
function serializeResumeFrame(frame, encoders) {
  const resumeTokenLength = encoders.resumeToken.byteLength(frame.resumeToken);
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + RESUME_FIXED_SIZE + resumeTokenLength
  );

  let offset = writeHeader(frame, buffer);
  offset = buffer.writeUInt16BE(frame.majorVersion, offset);
  offset = buffer.writeUInt16BE(frame.minorVersion, offset);
  offset = buffer.writeUInt16BE(resumeTokenLength, offset);
  offset = encoders.resumeToken.encode(
    frame.resumeToken,
    buffer,
    offset,
    offset + resumeTokenLength
  );

  offset = (0, _RSocketBufferUtils.writeUInt64BE)(
    buffer,
    frame.serverPosition,
    offset
  );
  (0, _RSocketBufferUtils.writeUInt64BE)(buffer, frame.clientPosition, offset);
  return buffer;
}

function sizeOfResumeFrame(frame, encoders) {
  const resumeTokenLength = encoders.resumeToken.byteLength(frame.resumeToken);
  return FRAME_HEADER_SIZE + RESUME_FIXED_SIZE + resumeTokenLength;
}

function deserializeResumeFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid RESUME frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  let offset = FRAME_HEADER_SIZE;
  const majorVersion = buffer.readUInt16BE(offset);
  offset += 2;
  const minorVersion = buffer.readUInt16BE(offset);
  offset += 2;

  const resumeTokenLength = buffer.readInt16BE(offset);
  offset += 2;
  (0, _Invariant.default)(
    resumeTokenLength >= 0 &&
      resumeTokenLength <= _RSocketFrame.MAX_RESUME_LENGTH,
    'RSocketBinaryFraming: Invalid SETUP frame, expected resumeToken length ' +
      'to be >= 0 and <= %s. Got `%s`.',
    _RSocketFrame.MAX_RESUME_LENGTH,
    resumeTokenLength
  );

  const resumeToken = encoders.resumeToken.decode(
    buffer,
    offset,
    offset + resumeTokenLength
  );

  offset += resumeTokenLength;
  const serverPosition = (0, _RSocketBufferUtils.readUInt64BE)(buffer, offset);
  offset += 8;
  const clientPosition = (0, _RSocketBufferUtils.readUInt64BE)(buffer, offset);
  offset += 8;
  return {
    clientPosition,
    flags,
    length,
    majorVersion,
    minorVersion,
    resumeToken,
    serverPosition,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.RESUME,
  };
}

/**
 * Writes a RESUME_OK frame into a new buffer and returns it.
 *
 * Fixed size is:
 * - client position (uint64 = 8)
 */
const RESUME_OK_FIXED_SIZE = 8;
function serializeResumeOkFrame(frame, encoders) {
  const buffer = (0, _RSocketBufferUtils.createBuffer)(
    FRAME_HEADER_SIZE + RESUME_OK_FIXED_SIZE
  );
  const offset = writeHeader(frame, buffer);
  (0, _RSocketBufferUtils.writeUInt64BE)(buffer, frame.clientPosition, offset);
  return buffer;
}

function sizeOfResumeOkFrame(frame, encoders) {
  return FRAME_HEADER_SIZE + RESUME_OK_FIXED_SIZE;
}

function deserializeResumeOkFrame(buffer, streamId, flags, encoders) {
  (0, _Invariant.default)(
    streamId === 0,
    'RSocketBinaryFraming: Invalid RESUME frame, expected stream id to be 0.'
  );

  const length = buffer.length;
  const clientPosition = (0, _RSocketBufferUtils.readUInt64BE)(
    buffer,
    FRAME_HEADER_SIZE
  );
  return {
    clientPosition,
    flags,
    length,
    streamId,
    type: _RSocketFrame.FRAME_TYPES.RESUME_OK,
  };
}

/**
 * Write the header of the frame into the buffer.
 */
function writeHeader(frame, buffer) {
  const offset = buffer.writeInt32BE(frame.streamId, 0);
  // shift frame to high 6 bits, extract lowest 10 bits from flags
  return buffer.writeUInt16BE(
    (frame.type << _RSocketFrame.FRAME_TYPE_OFFFSET) |
      (frame.flags & _RSocketFrame.FLAGS_MASK),
    offset
  );
}

/**
 * Determine the length of the payload section of a frame. Only applies to
 * frame types that MAY have both metadata and data.
 */
function getPayloadLength(frame, encoders) {
  let payloadLength = 0;
  if (frame.data != null) {
    payloadLength += encoders.data.byteLength(frame.data);
  }
  if ((0, _RSocketFrame.isMetadata)(frame.flags)) {
    payloadLength += UINT24_SIZE;
    if (frame.metadata != null) {
      payloadLength += encoders.metadata.byteLength(frame.metadata);
    }
  }
  return payloadLength;
}

/**
 * Write the payload of a frame into the given buffer. Only applies to frame
 * types that MAY have both metadata and data.
 */
function writePayload(frame, buffer, encoders, offset) {
  if ((0, _RSocketFrame.isMetadata)(frame.flags)) {
    if (frame.metadata != null) {
      const metaLength = encoders.metadata.byteLength(frame.metadata);
      offset = (0, _RSocketBufferUtils.writeUInt24BE)(
        buffer,
        metaLength,
        offset
      );
      offset = encoders.metadata.encode(
        frame.metadata,
        buffer,
        offset,
        offset + metaLength
      );
    } else {
      offset = (0, _RSocketBufferUtils.writeUInt24BE)(buffer, 0, offset);
    }
  }
  if (frame.data != null) {
    encoders.data.encode(frame.data, buffer, offset, buffer.length);
  }
}

/**
 * Read the payload from a buffer and write it into the frame. Only applies to
 * frame types that MAY have both metadata and data.
 */
function readPayload(buffer, frame, encoders, offset) {
  if ((0, _RSocketFrame.isMetadata)(frame.flags)) {
    const metaLength = (0, _RSocketBufferUtils.readUInt24BE)(buffer, offset);
    offset += UINT24_SIZE;
    if (metaLength > 0) {
      frame.metadata = encoders.metadata.decode(
        buffer,
        offset,
        offset + metaLength
      );

      offset += metaLength;
    }
  }
  if (offset < buffer.length) {
    frame.data = encoders.data.decode(buffer, offset, buffer.length);
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js":
/*!*******************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketBufferUtils.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */



/* eslint-disable no-bitwise */ Object.defineProperty(exports, "__esModule", ({
  value: true,
}));
exports.readUInt24BE = readUInt24BE;
exports.writeUInt24BE = writeUInt24BE;
exports.readUInt64BE = readUInt64BE;
exports.writeUInt64BE = writeUInt64BE;
exports.byteLength = byteLength;
exports.createBuffer = exports.toBuffer = void 0;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");

/**
 * Mimimum value that would overflow bitwise operators (2^32).
 */
const BITWISE_OVERFLOW = 0x100000000;

/**
 * Read a uint24 from a buffer starting at the given offset.
 */
function readUInt24BE(buffer, offset) {
  const val1 = buffer.readUInt8(offset) << 16;
  const val2 = buffer.readUInt8(offset + 1) << 8;
  const val3 = buffer.readUInt8(offset + 2);
  return val1 | val2 | val3;
}

/**
 * Writes a uint24 to a buffer starting at the given offset, returning the
 * offset of the next byte.
 */
function writeUInt24BE(buffer, value, offset) {
  offset = buffer.writeUInt8(value >>> 16, offset); // 3rd byte
  offset = buffer.writeUInt8((value >>> 8) & 0xff, offset); // 2nd byte
  return buffer.writeUInt8(value & 0xff, offset); // 1st byte
}

/**
 * Read a uint64 (technically supports up to 53 bits per JS number
 * representation).
 */
function readUInt64BE(buffer, offset) {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);
  return high * BITWISE_OVERFLOW + low;
}

/**
 * Write a uint64 (technically supports up to 53 bits per JS number
 * representation).
 */
function writeUInt64BE(buffer, value, offset) {
  const high = (value / BITWISE_OVERFLOW) | 0;
  const low = value % BITWISE_OVERFLOW;
  offset = buffer.writeUInt32BE(high, offset); // first half of uint64
  return buffer.writeUInt32BE(low, offset); // second half of uint64
}

/**
 * Determine the number of bytes it would take to encode the given data with the
 * given encoding.
 */
function byteLength(data, encoding) {
  if (data == null) {
    return 0;
  }
  return _LiteBuffer.LiteBuffer.byteLength(data, encoding);
}

/**
 * Attempts to construct a buffer from the input, throws if invalid.
 */
const toBuffer =
  typeof _LiteBuffer.LiteBuffer.from === 'function'
    ? (...args) => {
        // Buffer.from(buffer) copies which we don't want here
        if (args[0] instanceof _LiteBuffer.LiteBuffer) {
          return args[0];
        }
        return _LiteBuffer.LiteBuffer.from.apply(_LiteBuffer.LiteBuffer, args);
      }
    : (...args) => {
        // Buffer.from(buffer) copies which we don't want here
        if (args[0] instanceof _LiteBuffer.LiteBuffer) {
          return args[0];
        }
        return new (_LiteBuffer.LiteBuffer.bind.apply(_LiteBuffer.LiteBuffer, [
          _LiteBuffer.LiteBuffer,
          ...args,
        ]))();
      };

/**
 * Function to create a buffer of a given sized filled with zeros.
 */ exports.toBuffer = toBuffer;
const createBuffer =
  typeof _LiteBuffer.LiteBuffer.alloc === 'function'
    ? (length) => _LiteBuffer.LiteBuffer.alloc(length)
    : // $FlowFixMe
      (length) => new _LiteBuffer.LiteBuffer(length).fill(0);
exports.createBuffer = createBuffer;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketClient.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketClient.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");
var _RSocketVersion = __webpack_require__(/*! ./RSocketVersion */ "../../node_modules/rsocket-core/build/RSocketVersion.js");
var _RSocketMachine = __webpack_require__(/*! ./RSocketMachine */ "../../node_modules/rsocket-core/build/RSocketMachine.js");
var _RSocketLease = __webpack_require__(/*! ./RSocketLease */ "../../node_modules/rsocket-core/build/RSocketLease.js");

var _RSocketSerialization = __webpack_require__(/*! ./RSocketSerialization */ "../../node_modules/rsocket-core/build/RSocketSerialization.js");
var _ReassemblyDuplexConnection = __webpack_require__(/*! ./ReassemblyDuplexConnection */ "../../node_modules/rsocket-core/build/ReassemblyDuplexConnection.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * RSocketClient: A client in an RSocket connection that will communicates with
 * the peer via the given transport client. Provides methods for establishing a
 * connection and initiating the RSocket interactions:
 * - fireAndForget()
 * - requestResponse()
 * - requestStream()
 * - requestChannel()
 * - metadataPush()
 */
class RSocketClient {
  constructor(config) {
    this._checkConfig(config);
    this._cancel = null;
    this._config = config;
    this._connection = null;
    this._socket = null;
  }

  close() {
    this._config.transport.close();
  }

  connect() {
    (0, _Invariant.default)(
      !this._connection,
      'RSocketClient: Unexpected call to connect(), already connected.'
    );

    this._connection = new _rsocketFlowable.Single((subscriber) => {
      const transport = this._config.transport;
      let subscription;
      transport.connectionStatus().subscribe({
        onNext: (status) => {
          if (status.kind === 'CONNECTED') {
            subscription && subscription.cancel();
            subscriber.onComplete(
              new RSocketClientSocket(
                this._config,
                new _ReassemblyDuplexConnection.ReassemblyDuplexConnection(
                  transport
                )
              )
            );
          } else if (status.kind === 'ERROR') {
            subscription && subscription.cancel();
            subscriber.onError(status.error);
          } else if (status.kind === 'CLOSED') {
            subscription && subscription.cancel();
            subscriber.onError(new Error('RSocketClient: Connection closed.'));
          }
        },
        onSubscribe: (_subscription) => {
          subscription = _subscription;
          subscriber.onSubscribe(() => {
            _subscription.cancel();
            transport.close();
          });
          subscription.request(Number.MAX_SAFE_INTEGER);
        },
      });

      transport.connect();
    });
    return this._connection;
  }

  _checkConfig(config) {
    const setup = config.setup;
    const keepAlive = setup && setup.keepAlive;
    // wrap in try catch since in 'strict' mode the access to an unexciting window will throw
    // the ReferenceError: window is not defined exception
    try {
      // eslint-disable-next-line no-undef
      const navigator = window && window.navigator;
      if (
        keepAlive > 30000 &&
        navigator &&
        navigator.userAgent &&
        (navigator.userAgent.includes('Trident') ||
          navigator.userAgent.includes('Edg'))
      ) {
        console.warn(
          'rsocket-js: Due to a browser bug, Internet Explorer and Edge users may experience WebSocket instability with keepAlive values longer than 30 seconds.'
        );
      }
    } catch (e) {
      // ignore the error since it means that the code is running in non browser environment
    }
  }
}

/**
 * @private
 */ exports["default"] = RSocketClient;
class RSocketClientSocket {
  constructor(config, connection) {
    let requesterLeaseHandler;
    let responderLeaseHandler;

    const leasesSupplier = config.leases;
    if (leasesSupplier) {
      const lease = leasesSupplier();
      requesterLeaseHandler = new _RSocketLease.RequesterLeaseHandler(
        lease._receiver
      );
      responderLeaseHandler = new _RSocketLease.ResponderLeaseHandler(
        lease._sender,
        lease._stats
      );
    }
    const {keepAlive, lifetime} = config.setup;

    this._machine = (0, _RSocketMachine.createClientMachine)(
      connection,
      (subscriber) => connection.receive().subscribe(subscriber),
      lifetime,
      config.serializers,
      config.responder,
      config.errorHandler,
      requesterLeaseHandler,
      responderLeaseHandler
    );

    // Send SETUP
    connection.sendOne(this._buildSetupFrame(config));

    // Send KEEPALIVE frames
    const keepAliveFrames = (0, _rsocketFlowable.every)(keepAlive).map(() => ({
      data: null,
      flags: _RSocketFrame.FLAGS.RESPOND,
      lastReceivedPosition: 0,
      streamId: _RSocketFrame.CONNECTION_STREAM_ID,
      type: _RSocketFrame.FRAME_TYPES.KEEPALIVE,
    }));

    connection.send(keepAliveFrames);
  }

  fireAndForget(payload) {
    this._machine.fireAndForget(payload);
  }

  requestResponse(payload) {
    return this._machine.requestResponse(payload);
  }

  requestStream(payload) {
    return this._machine.requestStream(payload);
  }

  requestChannel(payloads) {
    return this._machine.requestChannel(payloads);
  }

  metadataPush(payload) {
    return this._machine.metadataPush(payload);
  }

  close() {
    this._machine.close();
  }

  connectionStatus() {
    return this._machine.connectionStatus();
  }

  availability() {
    return this._machine.availability();
  }

  _buildSetupFrame(config) {
    const {
      dataMimeType,
      keepAlive,
      lifetime,
      metadataMimeType,
      payload,
    } = config.setup;

    const serializers =
      config.serializers || _RSocketSerialization.IdentitySerializers;
    const data = payload ? serializers.data.serialize(payload.data) : undefined;
    const metadata = payload
      ? serializers.metadata.serialize(payload.metadata)
      : undefined;
    let flags = 0;
    if (metadata !== undefined) {
      flags |= _RSocketFrame.FLAGS.METADATA;
    }
    return {
      data,
      dataMimeType,
      flags: flags | (config.leases ? _RSocketFrame.FLAGS.LEASE : 0),
      keepAlive,
      lifetime,
      majorVersion: _RSocketVersion.MAJOR_VERSION,
      metadata,
      metadataMimeType,
      minorVersion: _RSocketVersion.MINOR_VERSION,
      resumeToken: null,
      streamId: _RSocketFrame.CONNECTION_STREAM_ID,
      type: _RSocketFrame.FRAME_TYPES.SETUP,
    };
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketEncoding.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketEncoding.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports.BufferEncoders = exports.Utf8Encoders = exports.BufferEncoder = exports.UTF8Encoder = void 0;

var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js");
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const UTF8Encoder = {
  byteLength: (value) => (0, _RSocketBufferUtils.byteLength)(value, 'utf8'),
  decode: (buffer, start, end) => {
    return buffer.toString('utf8', start, end);
  },
  encode: (value, buffer, start, end) => {
    (0, _Invariant.default)(
      typeof value === 'string',
      'RSocketEncoding: Expected value to be a string, got `%s`.',
      value
    );

    buffer.write(value, start, end - start, 'utf8');
    return end;
  },
};
exports.UTF8Encoder = UTF8Encoder;

const BufferEncoder = {
  byteLength: (value) => {
    (0, _Invariant.default)(
      Buffer.isBuffer(value),
      'RSocketEncoding: Expected value to be a buffer, got `%s`.',
      value
    );

    return value.length;
  },
  decode: (buffer, start, end) => {
    return buffer.slice(start, end);
  },
  encode: (value, buffer, start, end) => {
    (0, _Invariant.default)(
      Buffer.isBuffer(value),
      'RSocketEncoding: Expected value to be a buffer, got `%s`.',
      value
    );

    value.copy(buffer, start, 0, value.length);
    return end;
  },
};

/**
 * Encode all values as UTF8 strings.
 */ exports.BufferEncoder = BufferEncoder;
const Utf8Encoders = {
  data: UTF8Encoder,
  dataMimeType: UTF8Encoder,
  message: UTF8Encoder,
  metadata: UTF8Encoder,
  metadataMimeType: UTF8Encoder,
  resumeToken: UTF8Encoder,
};

/**
 * Encode all values as buffers.
 */ exports.Utf8Encoders = Utf8Encoders;
const BufferEncoders = {
  data: BufferEncoder,
  dataMimeType: UTF8Encoder,
  message: UTF8Encoder,
  metadata: BufferEncoder,
  metadataMimeType: UTF8Encoder,
  resumeToken: BufferEncoder,
};
exports.BufferEncoders = BufferEncoders;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketFrame.js":
/*!*************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketFrame.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


/* eslint-disable max-len, no-bitwise */ Object.defineProperty(exports, "__esModule", ({value: true}));
exports.isIgnore = isIgnore;
exports.isMetadata = isMetadata;
exports.isComplete = isComplete;
exports.isNext = isNext;
exports.isRespond = isRespond;
exports.isResumeEnable = isResumeEnable;
exports.isLease = isLease;
exports.isFollows = isFollows;
exports.isResumePositionFrameType = isResumePositionFrameType;
exports.getFrameTypeName = getFrameTypeName;
exports.createErrorFromFrame = createErrorFromFrame;
exports.getErrorCodeExplanation = getErrorCodeExplanation;
exports.printFrame = printFrame;
exports.MAX_VERSION = exports.MAX_TTL = exports.MAX_STREAM_ID = exports.MAX_RESUME_LENGTH = exports.MAX_REQUEST_N = exports.MAX_REQUEST_COUNT = exports.MAX_MIME_LENGTH = exports.MAX_METADATA_LENGTH = exports.MAX_LIFETIME = exports.MAX_KEEPALIVE = exports.MAX_CODE = exports.FRAME_TYPE_OFFFSET = exports.FLAGS_MASK = exports.ERROR_EXPLANATIONS = exports.ERROR_CODES = exports.FLAGS = exports.FRAME_TYPE_NAMES = exports.FRAME_TYPES = exports.CONNECTION_STREAM_ID = void 0;
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const CONNECTION_STREAM_ID = 0;
exports.CONNECTION_STREAM_ID = CONNECTION_STREAM_ID;

const FRAME_TYPES = {
  CANCEL: 0x09, // Cancel Request: Cancel outstanding request.
  ERROR: 0x0b, // Error: Error at connection or application level.
  EXT: 0x3f, // Extension Header: Used To Extend more frame types as well as extensions.
  KEEPALIVE: 0x03, // Keepalive: Connection keepalive.
  LEASE: 0x02, // Lease: Sent by Responder to grant the ability to send requests.
  METADATA_PUSH: 0x0c, // Metadata: Asynchronous Metadata frame
  PAYLOAD: 0x0a, // Payload: Payload on a stream. For example, response to a request, or message on a channel.
  REQUEST_CHANNEL: 0x07, // Request Channel: Request a completable stream in both directions.
  REQUEST_FNF: 0x05, // Fire And Forget: A single one-way message.
  REQUEST_N: 0x08, // Request N: Request N more items with Reactive Streams semantics.
  REQUEST_RESPONSE: 0x04, // Request Response: Request single response.
  REQUEST_STREAM: 0x06, // Request Stream: Request a completable stream.
  RESERVED: 0x00, // Reserved
  RESUME: 0x0d, // Resume: Replaces SETUP for Resuming Operation (optional)
  RESUME_OK: 0x0e, // Resume OK : Sent in response to a RESUME if resuming operation possible (optional)
  SETUP: 0x01, // Setup: Sent by client to initiate protocol processing.
};

// Maps frame type codes to type names
exports.FRAME_TYPES = FRAME_TYPES;
const FRAME_TYPE_NAMES = {};
exports.FRAME_TYPE_NAMES = FRAME_TYPE_NAMES;
for (const name in FRAME_TYPES) {
  const value = FRAME_TYPES[name];
  FRAME_TYPE_NAMES[value] = name;
}

const FLAGS = {
  COMPLETE: 0x40, // PAYLOAD, REQUEST_CHANNEL: indicates stream completion, if set onComplete will be invoked on receiver.
  FOLLOWS: 0x80, // PAYLOAD, REQUEST_XXX: indicates that frame was fragmented and requires reassembly
  IGNORE: 0x200, // (all): Ignore frame if not understood.
  LEASE: 0x40, // SETUP: Will honor lease or not.
  METADATA: 0x100, // (all): must be set if metadata is present in the frame.
  NEXT: 0x20, // PAYLOAD: indicates data/metadata present, if set onNext will be invoked on receiver.
  RESPOND: 0x80, // KEEPALIVE: should KEEPALIVE be sent by peer on receipt.
  RESUME_ENABLE: 0x80, // SETUP: Client requests resume capability if possible. Resume Identification Token present.
};

// Maps error names to codes
exports.FLAGS = FLAGS;
const ERROR_CODES = {
  APPLICATION_ERROR: 0x00000201,
  CANCELED: 0x00000203,
  CONNECTION_CLOSE: 0x00000102,
  CONNECTION_ERROR: 0x00000101,
  INVALID: 0x00000204,
  INVALID_SETUP: 0x00000001,
  REJECTED: 0x00000202,
  REJECTED_RESUME: 0x00000004,
  REJECTED_SETUP: 0x00000003,
  RESERVED: 0x00000000,
  RESERVED_EXTENSION: 0xffffffff,
  UNSUPPORTED_SETUP: 0x00000002,
};

// Maps error codes to names
exports.ERROR_CODES = ERROR_CODES;
const ERROR_EXPLANATIONS = {};
exports.ERROR_EXPLANATIONS = ERROR_EXPLANATIONS;
for (const explanation in ERROR_CODES) {
  const code = ERROR_CODES[explanation];
  ERROR_EXPLANATIONS[code] = explanation;
}

const FLAGS_MASK = 0x3ff; // low 10 bits
exports.FLAGS_MASK = FLAGS_MASK;
const FRAME_TYPE_OFFFSET = 10; // frame type is offset 10 bytes within the uint16 containing type + flags
exports.FRAME_TYPE_OFFFSET = FRAME_TYPE_OFFFSET;
const MAX_CODE = 0x7fffffff; // uint31
exports.MAX_CODE = MAX_CODE;
const MAX_KEEPALIVE = 0x7fffffff; // uint31
exports.MAX_KEEPALIVE = MAX_KEEPALIVE;
const MAX_LIFETIME = 0x7fffffff; // uint31
exports.MAX_LIFETIME = MAX_LIFETIME;
const MAX_METADATA_LENGTH = 0xffffff; // uint24
exports.MAX_METADATA_LENGTH = MAX_METADATA_LENGTH;
const MAX_MIME_LENGTH = 0xff; // int8
exports.MAX_MIME_LENGTH = MAX_MIME_LENGTH;
const MAX_REQUEST_COUNT = 0x7fffffff; // uint31
exports.MAX_REQUEST_COUNT = MAX_REQUEST_COUNT;
const MAX_REQUEST_N = 0x7fffffff; // uint31
exports.MAX_REQUEST_N = MAX_REQUEST_N;
const MAX_RESUME_LENGTH = 0xffff; // uint16
exports.MAX_RESUME_LENGTH = MAX_RESUME_LENGTH;
const MAX_STREAM_ID = 0x7fffffff; // uint31
exports.MAX_STREAM_ID = MAX_STREAM_ID;
const MAX_TTL = 0x7fffffff; // uint31
exports.MAX_TTL = MAX_TTL;
const MAX_VERSION = 0xffff; // uint16

/**
 * Returns true iff the flags have the IGNORE bit set.
 */ exports.MAX_VERSION = MAX_VERSION;
function isIgnore(flags) {
  return (flags & FLAGS.IGNORE) === FLAGS.IGNORE;
}

/**
 * Returns true iff the flags have the METADATA bit set.
 */
function isMetadata(flags) {
  return (flags & FLAGS.METADATA) === FLAGS.METADATA;
}

/**
 * Returns true iff the flags have the COMPLETE bit set.
 */
function isComplete(flags) {
  return (flags & FLAGS.COMPLETE) === FLAGS.COMPLETE;
}

/**
 * Returns true iff the flags have the NEXT bit set.
 */
function isNext(flags) {
  return (flags & FLAGS.NEXT) === FLAGS.NEXT;
}

/**
 * Returns true iff the flags have the RESPOND bit set.
 */
function isRespond(flags) {
  return (flags & FLAGS.RESPOND) === FLAGS.RESPOND;
}

/**
 * Returns true iff the flags have the RESUME_ENABLE bit set.
 */
function isResumeEnable(flags) {
  return (flags & FLAGS.RESUME_ENABLE) === FLAGS.RESUME_ENABLE;
}

/**
 * Returns true iff the flags have the LEASE bit set.
 */
function isLease(flags) {
  return (flags & FLAGS.LEASE) === FLAGS.LEASE;
}

function isFollows(flags) {
  return (flags & FLAGS.FOLLOWS) === FLAGS.FOLLOWS;
}

/**
 * Returns true iff the frame type is counted toward the implied
 * client/server position used for the resumption protocol.
 */
function isResumePositionFrameType(type) {
  return (
    type === FRAME_TYPES.CANCEL ||
    type === FRAME_TYPES.ERROR ||
    type === FRAME_TYPES.PAYLOAD ||
    type === FRAME_TYPES.REQUEST_CHANNEL ||
    type === FRAME_TYPES.REQUEST_FNF ||
    type === FRAME_TYPES.REQUEST_RESPONSE ||
    type === FRAME_TYPES.REQUEST_STREAM ||
    type === FRAME_TYPES.REQUEST_N
  );
}

function getFrameTypeName(type) {
  const name = FRAME_TYPE_NAMES[type];
  return name != null ? name : toHex(type);
}

function sprintf(format, ...args) {
  let index = 0;
  return format.replace(/%s/g, (match) => args[index++]);
}

/**
 * Constructs an Error object given the contents of an error frame. The
 * `source` property contains metadata about the error for use in introspecting
 * the error at runtime:
 * - `error.source.code: number`: the error code returned by the server.
 * - `error.source.explanation: string`: human-readable explanation of the code
 *   (this value is not standardized and may change).
 * - `error.source.message: string`: the error string returned by the server.
 */
function createErrorFromFrame(frame) {
  const {code, message} = frame;
  const explanation = getErrorCodeExplanation(code);
  const error = new Error(
    sprintf(
      'RSocket error %s (%s): %s. See error `source` property for details.',
      toHex(code),
      explanation,
      message
    )
  );

  error.source = {
    code,
    explanation,
    message,
  };

  return error;
}

/**
 * Given a RSocket error code, returns a human-readable explanation of that
 * code, following the names used in the protocol specification.
 */
function getErrorCodeExplanation(code) {
  const explanation = ERROR_EXPLANATIONS[code];
  if (explanation != null) {
    return explanation;
  } else if (code <= 0x00300) {
    return 'RESERVED (PROTOCOL)';
  } else {
    return 'RESERVED (APPLICATION)';
  }
}

/**
 * Pretty-prints the frame for debugging purposes, with types, flags, and
 * error codes annotated with descriptive names.
 */
function printFrame(frame) {
  const obj = _objectSpread({}, frame);
  obj.type = getFrameTypeName(frame.type) + ` (${toHex(frame.type)})`;
  const flagNames = [];
  for (const name in FLAGS) {
    const flag = FLAGS[name];
    if ((frame.flags & flag) === flag) {
      flagNames.push(name);
    }
  }
  if (!flagNames.length) {
    flagNames.push('NO FLAGS');
  }
  obj.flags = flagNames.join(' | ') + ` (${toHex(frame.flags)})`;
  if (frame.type === FRAME_TYPES.ERROR) {
    obj.code = getErrorCodeExplanation(frame.code) + ` (${toHex(frame.code)})`;
  }
  return JSON.stringify(obj, null, 2);
}

function toHex(n) {
  return '0x' + n.toString(16);
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketLease.js":
/*!*************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketLease.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright 2015-2019 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.ResponderLeaseHandler = exports.RequesterLeaseHandler = exports.Leases = exports.Lease = void 0;

var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");

var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class Lease {
  constructor(timeToLiveMillis, allowedRequests, metadata) {
    (0, _Invariant.default)(
      timeToLiveMillis > 0,
      'Lease time-to-live must be positive'
    );
    (0, _Invariant.default)(
      allowedRequests > 0,
      'Lease allowed requests must be positive'
    );
    this.timeToLiveMillis = timeToLiveMillis;
    this.allowedRequests = allowedRequests;
    this.startingAllowedRequests = allowedRequests;
    this.expiry = Date.now() + timeToLiveMillis;
    this.metadata = metadata;
  }

  expired() {
    return Date.now() > this.expiry;
  }

  valid() {
    return this.allowedRequests > 0 && !this.expired();
  }

  // todo hide
  _use() {
    if (this.expired()) {
      return false;
    }
    const allowed = this.allowedRequests;
    const success = allowed > 0;
    if (success) {
      this.allowedRequests = allowed - 1;
    }
    return success;
  }
}
exports.Lease = Lease;

class Leases {
  constructor() {
    _defineProperty(this, '_sender', () => _rsocketFlowable.Flowable.never());
    _defineProperty(this, '_receiver', (leases) => {});
  }

  sender(sender) {
    this._sender = sender;
    return this;
  }

  receiver(receiver) {
    this._receiver = receiver;
    return this;
  }

  stats(stats) {
    this._stats = stats;
    return this;
  }
}
exports.Leases = Leases;

class RequesterLeaseHandler {
  /*negative value means received lease was not signalled due to missing requestN*/

  constructor(leaseReceiver) {
    _defineProperty(this, '_requestN', -1);
    leaseReceiver(
      new _rsocketFlowable.Flowable((subscriber) => {
        if (this._subscriber) {
          subscriber.onError(new Error('only 1 subscriber is allowed'));
          return;
        }
        if (this.isDisposed()) {
          subscriber.onComplete();
          return;
        }
        this._subscriber = subscriber;
        subscriber.onSubscribe({
          cancel: () => {
            this.dispose();
          },
          request: (n) => {
            if (n <= 0) {
              subscriber.onError(
                new Error(`request demand must be positive: ${n}`)
              );
            }
            if (!this.isDisposed()) {
              const curReqN = this._requestN;
              this._onRequestN(curReqN);
              this._requestN = Math.min(
                Number.MAX_SAFE_INTEGER,
                Math.max(0, curReqN) + n
              );
            }
          },
        });
      })
    );
  }

  use() {
    const l = this._lease;
    return l ? l._use() : false;
  }

  errorMessage() {
    return _errorMessage(this._lease);
  }

  receive(frame) {
    if (!this.isDisposed()) {
      const timeToLiveMillis = frame.ttl;
      const requestCount = frame.requestCount;
      const metadata = frame.metadata;
      this._onLease(new Lease(timeToLiveMillis, requestCount, metadata));
    }
  }

  availability() {
    const l = this._lease;
    if (l && l.valid()) {
      return l.allowedRequests / l.startingAllowedRequests;
    }
    return 0.0;
  }

  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      const s = this._subscriber;
      if (s) {
        s.onComplete();
      }
    }
  }

  isDisposed() {
    return this._isDisposed;
  }

  _onRequestN(requestN) {
    const l = this._lease;
    const s = this._subscriber;
    if (requestN < 0 && l && s) {
      s.onNext(l);
    }
  }

  _onLease(lease) {
    const s = this._subscriber;
    const newReqN = this._requestN - 1;
    if (newReqN >= 0 && s) {
      s.onNext(lease);
    }
    this._requestN = Math.max(-1, newReqN);
    this._lease = lease;
  }
}
exports.RequesterLeaseHandler = RequesterLeaseHandler;

class ResponderLeaseHandler {
  constructor(leaseSender, stats, errorConsumer) {
    this._leaseSender = leaseSender;
    this._stats = stats;
    this._errorConsumer = errorConsumer;
  }

  use() {
    const l = this._lease;
    const success = l ? l._use() : false;
    this._onStatsEvent(success);
    return success;
  }

  errorMessage() {
    return _errorMessage(this._lease);
  }

  send(send) {
    let subscription;
    let isDisposed;

    this._leaseSender(this._stats).subscribe({
      onComplete: () => this._onStatsEvent(),
      onError: (error) => {
        this._onStatsEvent();
        const errConsumer = this._errorConsumer;
        if (errConsumer) {
          errConsumer(error);
        }
      },
      onNext: (lease) => {
        this._lease = lease;
        send(lease);
      },
      onSubscribe: (s) => {
        if (isDisposed) {
          s.cancel();
          return;
        }
        s.request(_RSocketFrame.MAX_REQUEST_N);
        subscription = s;
      },
    });

    return {
      dispose() {
        if (!isDisposed) {
          isDisposed = true;
          this._onStatsEvent();
          if (subscription) {
            subscription.cancel();
          }
        }
      },

      isDisposed() {
        return isDisposed;
      },
    };
  }

  _onStatsEvent(success) {
    const s = this._stats;
    if (s) {
      const event =
        success === undefined ? 'Terminate' : success ? 'Accept' : 'Reject';
      s.onEvent(event);
    }
  }
}
exports.ResponderLeaseHandler = ResponderLeaseHandler;

function _errorMessage(lease) {
  if (!lease) {
    return 'Lease was not received yet';
  }
  if (lease.valid()) {
    return 'Missing leases';
  } else {
    const isExpired = lease.expired();
    const requests = lease.allowedRequests;
    return `Missing leases. Expired: ${isExpired.toString()}, allowedRequests: ${requests}`;
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketMachine.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketMachine.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports.createServerMachine = createServerMachine;
exports.createClientMachine = createClientMachine;

var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");

var _RSocketSerialization = __webpack_require__(/*! ./RSocketSerialization */ "../../node_modules/rsocket-core/build/RSocketSerialization.js");
var _RSocketLease = __webpack_require__(/*! ./RSocketLease */ "../../node_modules/rsocket-core/build/RSocketLease.js");
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class ResponderWrapper {
  constructor(responder) {
    this._responder = responder || {};
  }

  setResponder(responder) {
    this._responder = responder || {};
  }

  fireAndForget(payload) {
    if (this._responder.fireAndForget) {
      try {
        this._responder.fireAndForget(payload);
      } catch (error) {
        console.error('fireAndForget threw an exception', error);
      }
    }
  }

  requestResponse(payload) {
    let error;
    if (this._responder.requestResponse) {
      try {
        return this._responder.requestResponse(payload);
      } catch (_error) {
        console.error('requestResponse threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Single.error(error || new Error('not implemented'));
  }

  requestStream(payload) {
    let error;
    if (this._responder.requestStream) {
      try {
        return this._responder.requestStream(payload);
      } catch (_error) {
        console.error('requestStream threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Flowable.error(
      error || new Error('not implemented')
    );
  }

  requestChannel(payloads) {
    let error;
    if (this._responder.requestChannel) {
      try {
        return this._responder.requestChannel(payloads);
      } catch (_error) {
        console.error('requestChannel threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Flowable.error(
      error || new Error('not implemented')
    );
  }

  metadataPush(payload) {
    let error;
    if (this._responder.metadataPush) {
      try {
        return this._responder.metadataPush(payload);
      } catch (_error) {
        console.error('metadataPush threw an exception', _error);
        error = _error;
      }
    }
    return _rsocketFlowable.Single.error(error || new Error('not implemented'));
  }
}

function createServerMachine(
  connection,
  connectionPublisher,
  keepAliveTimeout,
  serializers,
  errorHandler,
  requesterLeaseHandler,
  responderLeaseHandler
) {
  return new RSocketMachineImpl(
    'SERVER',
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    undefined,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  );
}

function createClientMachine(
  connection,
  connectionPublisher,
  keepAliveTimeout,
  serializers,
  requestHandler,
  errorHandler,
  requesterLeaseHandler,
  responderLeaseHandler
) {
  return new RSocketMachineImpl(
    'CLIENT',
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    requestHandler,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  );
}

class RSocketMachineImpl {
  constructor(
    role,
    connection,
    connectionPublisher,
    keepAliveTimeout,
    serializers,
    requestHandler,
    errorHandler,
    requesterLeaseHandler,
    responderLeaseHandler
  ) {
    _defineProperty(this, '_connectionAvailability', 1.0);
    _defineProperty(
      this,
      '_handleTransportClose',

      () => {
        this._handleError(new Error('RSocket: The connection was closed.'));
      }
    );
    _defineProperty(
      this,
      '_handleError',

      (error) => {
        // Error any open request streams
        this._receivers.forEach((receiver) => {
          receiver.onError(error);
        });
        this._receivers.clear();
        // Cancel any active subscriptions
        this._subscriptions.forEach((subscription) => {
          subscription.cancel();
        });
        this._subscriptions.clear();
        this._connectionAvailability = 0.0;
        this._dispose(
          this._requesterLeaseHandler,
          this._responderLeaseSenderDisposable
        );

        const handle = this._keepAliveTimerHandle;
        if (handle) {
          clearTimeout(handle);
          this._keepAliveTimerHandle = null;
        }
      }
    );
    _defineProperty(
      this,
      '_handleFrame',

      (frame) => {
        const {streamId} = frame;
        if (streamId === _RSocketFrame.CONNECTION_STREAM_ID) {
          this._handleConnectionFrame(frame);
        } else {
          this._handleStreamFrame(streamId, frame);
        }
      }
    );
    this._connection = connection;
    this._requesterLeaseHandler = requesterLeaseHandler;
    this._responderLeaseHandler = responderLeaseHandler;
    this._nextStreamId = role === 'CLIENT' ? 1 : 2;
    this._receivers = new Map();
    this._subscriptions = new Map();
    this._serializers =
      serializers || _RSocketSerialization.IdentitySerializers;
    this._requestHandler = new ResponderWrapper(requestHandler);
    this._errorHandler = errorHandler; // Subscribe to completion/errors before sending anything
    connectionPublisher({
      onComplete: this._handleTransportClose,
      onError: this._handleError,
      onNext: this._handleFrame,
      onSubscribe: (subscription) =>
        subscription.request(Number.MAX_SAFE_INTEGER),
    });
    const responderHandler = this._responderLeaseHandler;
    if (responderHandler) {
      this._responderLeaseSenderDisposable = responderHandler.send(
        this._leaseFrameSender()
      );
    } // Cleanup when the connection closes
    this._connection.connectionStatus().subscribe({
      onNext: (status) => {
        if (status.kind === 'CLOSED') {
          this._handleTransportClose();
        } else if (status.kind === 'ERROR') {
          this._handleError(status.error);
        }
      },
      onSubscribe: (subscription) =>
        subscription.request(Number.MAX_SAFE_INTEGER),
    });
    const MIN_TICK_DURATION = 100;
    this._keepAliveLastReceivedMillis = Date.now();
    const keepAliveHandler = () => {
      const now = Date.now();
      const noKeepAliveDuration = now - this._keepAliveLastReceivedMillis;
      if (noKeepAliveDuration >= keepAliveTimeout) {
        this._handleConnectionError(
          new Error(`No keep-alive acks for ${keepAliveTimeout} millis`)
        );
      } else {
        this._keepAliveTimerHandle = setTimeout(
          keepAliveHandler,
          Math.max(MIN_TICK_DURATION, keepAliveTimeout - noKeepAliveDuration)
        );
      }
    };
    this._keepAliveTimerHandle = setTimeout(keepAliveHandler, keepAliveTimeout);
  }
  setRequestHandler(requestHandler) {
    this._requestHandler.setResponder(requestHandler);
  }
  close() {
    this._connection.close();
  }
  connectionStatus() {
    return this._connection.connectionStatus();
  }
  availability() {
    const r = this._requesterLeaseHandler;
    const requesterAvailability = r ? r.availability() : 1.0;
    return Math.min(this._connectionAvailability, requesterAvailability);
  }
  fireAndForget(payload) {
    if (this._useLeaseOrError(this._requesterLeaseHandler)) {
      return;
    }
    const streamId = this._getNextStreamId(this._receivers);
    const data = this._serializers.data.serialize(payload.data);
    const metadata = this._serializers.metadata.serialize(payload.metadata);
    const frame = {
      data,
      flags: payload.metadata !== undefined ? _RSocketFrame.FLAGS.METADATA : 0,
      metadata,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.REQUEST_FNF,
    };
    this._connection.sendOne(frame);
  }
  requestResponse(payload) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Single.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    return new _rsocketFlowable.Single((subscriber) => {
      this._receivers.set(streamId, {
        onComplete: () => {},
        onError: (error) => subscriber.onError(error),
        onNext: (data) => subscriber.onComplete(data),
      });
      const data = this._serializers.data.serialize(payload.data);
      const metadata = this._serializers.metadata.serialize(payload.metadata);
      const frame = {
        data,
        flags:
          payload.metadata !== undefined ? _RSocketFrame.FLAGS.METADATA : 0,
        metadata,
        streamId,
        type: _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE,
      };
      this._connection.sendOne(frame);
      subscriber.onSubscribe(() => {
        this._receivers.delete(streamId);
        const cancelFrame = {
          flags: 0,
          streamId,
          type: _RSocketFrame.FRAME_TYPES.CANCEL,
        };
        this._connection.sendOne(cancelFrame);
      });
    });
  }
  requestStream(payload) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Flowable.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    return new _rsocketFlowable.Flowable((subscriber) => {
      this._receivers.set(streamId, subscriber);
      let initialized = false;
      subscriber.onSubscribe({
        cancel: () => {
          this._receivers.delete(streamId);
          if (!initialized) {
            return;
          }
          const cancelFrame = {
            flags: 0,
            streamId,
            type: _RSocketFrame.FRAME_TYPES.CANCEL,
          };
          this._connection.sendOne(cancelFrame);
        },
        request: (n) => {
          if (n > _RSocketFrame.MAX_REQUEST_N) {
            n = _RSocketFrame.MAX_REQUEST_N;
          }
          if (initialized) {
            const requestNFrame = {
              flags: 0,
              requestN: n,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
            };
            this._connection.sendOne(requestNFrame);
          } else {
            initialized = true;
            const data = this._serializers.data.serialize(payload.data);
            const metadata = this._serializers.metadata.serialize(
              payload.metadata
            );
            const requestStreamFrame = {
              data,
              flags:
                payload.metadata !== undefined
                  ? _RSocketFrame.FLAGS.METADATA
                  : 0,
              metadata,
              requestN: n,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.REQUEST_STREAM,
            };
            this._connection.sendOne(requestStreamFrame);
          }
        },
      });
    }, _RSocketFrame.MAX_REQUEST_N);
  }
  requestChannel(payloads) {
    const leaseError = this._useLeaseOrError(this._requesterLeaseHandler);
    if (leaseError) {
      return _rsocketFlowable.Flowable.error(new Error(leaseError));
    }
    const streamId = this._getNextStreamId(this._receivers);
    let payloadsSubscribed = false;
    return new _rsocketFlowable.Flowable((subscriber) => {
      try {
        this._receivers.set(streamId, subscriber);
        let initialized = false;
        subscriber.onSubscribe({
          cancel: () => {
            this._receivers.delete(streamId);
            if (!initialized) {
              return;
            }
            const cancelFrame = {
              flags: 0,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.CANCEL,
            };
            this._connection.sendOne(cancelFrame);
          },
          request: (n) => {
            if (n > _RSocketFrame.MAX_REQUEST_N) {
              n = _RSocketFrame.MAX_REQUEST_N;
            }
            if (initialized) {
              const requestNFrame = {
                flags: 0,
                requestN: n,
                streamId,
                type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
              };
              this._connection.sendOne(requestNFrame);
            } else {
              if (!payloadsSubscribed) {
                payloadsSubscribed = true;
                payloads.subscribe({
                  onComplete: () => {
                    this._sendStreamComplete(streamId);
                  },
                  onError: (error) => {
                    this._sendStreamError(streamId, error.message);
                  }, //Subscriber methods
                  onNext: (payload) => {
                    const data = this._serializers.data.serialize(payload.data);
                    const metadata = this._serializers.metadata.serialize(
                      payload.metadata
                    );
                    if (!initialized) {
                      initialized = true;
                      const requestChannelFrame = {
                        data,
                        flags:
                          payload.metadata !== undefined
                            ? _RSocketFrame.FLAGS.METADATA
                            : 0,
                        metadata,
                        requestN: n,
                        streamId,
                        type: _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL,
                      };
                      this._connection.sendOne(requestChannelFrame);
                    } else {
                      const payloadFrame = {
                        data,
                        flags:
                          _RSocketFrame.FLAGS.NEXT |
                          (payload.metadata !== undefined
                            ? _RSocketFrame.FLAGS.METADATA
                            : 0),
                        metadata,
                        streamId,
                        type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
                      };
                      this._connection.sendOne(payloadFrame);
                    }
                  },
                  onSubscribe: (subscription) => {
                    this._subscriptions.set(streamId, subscription);
                    subscription.request(1);
                  },
                });
              } else {
                console.warn(
                  'RSocketClient: re-entrant call to request n before initial' +
                    ' channel established.'
                );
              }
            }
          },
        });
      } catch (err) {
        console.warn('Exception while subscribing to channel flowable:' + err);
      }
    }, _RSocketFrame.MAX_REQUEST_N);
  }
  metadataPush(payload) {
    return new _rsocketFlowable.Single((subscriber) => {
      const metadata = this._serializers.metadata.serialize(payload.metadata);
      const frame = {
        flags: 0,
        metadata,
        streamId: 0,
        type: _RSocketFrame.FRAME_TYPES.METADATA_PUSH,
      };
      this._connection.sendOne(frame);
      subscriber.onSubscribe(() => {});
      subscriber.onComplete();
    });
  }
  _getNextStreamId(streamIds) {
    const streamId = this._nextStreamId;
    do {
      this._nextStreamId =
        (this._nextStreamId + 2) & _RSocketFrame.MAX_STREAM_ID;
    } while (this._nextStreamId === 0 || streamIds.has(streamId));
    return streamId;
  }
  _useLeaseOrError(leaseHandler) {
    if (leaseHandler) {
      if (!leaseHandler.use()) {
        return leaseHandler.errorMessage();
      }
    }
  }
  _leaseFrameSender() {
    return (lease) =>
      this._connection.sendOne({
        flags: 0,
        metadata: lease.metadata,
        requestCount: lease.allowedRequests,
        streamId: _RSocketFrame.CONNECTION_STREAM_ID,
        ttl: lease.timeToLiveMillis,
        type: _RSocketFrame.FRAME_TYPES.LEASE,
      });
  }
  _dispose(...disposables) {
    disposables.forEach((d) => {
      if (d) {
        d.dispose();
      }
    });
  }
  _isRequest(frameType) {
    switch (frameType) {
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
        return true;
      default:
        return false;
    }
  }
  /**
   * Handle the connection closing normally: this is an error for any open streams.
   */ _handleConnectionError(error) {
    this._handleError(error);
    this._connection.close();
    const errorHandler = this._errorHandler;
    if (errorHandler) {
      errorHandler(error);
    }
  }
  /**
   * Handle a frame received from the transport client.
   */ /**
   * Handle connection frames (stream id === 0).
   */ _handleConnectionFrame(frame) {
    switch (frame.type) {
      case _RSocketFrame.FRAME_TYPES.ERROR:
        const error = (0, _RSocketFrame.createErrorFromFrame)(frame);
        this._handleConnectionError(error);
        break;
      case _RSocketFrame.FRAME_TYPES.EXT:
        // Extensions are not supported
        break;
      case _RSocketFrame.FRAME_TYPES.KEEPALIVE:
        this._keepAliveLastReceivedMillis = Date.now();
        if ((0, _RSocketFrame.isRespond)(frame.flags)) {
          this._connection.sendOne(
            _objectSpread(
              _objectSpread({}, frame),
              {},
              {
                flags: frame.flags ^ _RSocketFrame.FLAGS.RESPOND, // eslint-disable-line no-bitwise
                lastReceivedPosition: 0,
              }
            )
          );
        }
        break;
      case _RSocketFrame.FRAME_TYPES.LEASE:
        const r = this._requesterLeaseHandler;
        if (r) {
          r.receive(frame);
        }
        break;
      case _RSocketFrame.FRAME_TYPES.METADATA_PUSH:
        this._handleMetadataPush(frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
        // TODO #18064706: handle requests from server
        break;
      case _RSocketFrame.FRAME_TYPES.RESERVED:
        // No-op
        break;
      case _RSocketFrame.FRAME_TYPES.RESUME:
      case _RSocketFrame.FRAME_TYPES.RESUME_OK:
        // TODO #18065016: support resumption
        break;
      default:
        if (false) {}
        break;
    }
  }

  /**
   * Handle stream-specific frames (stream id !== 0).
   */
  _handleStreamFrame(streamId, frame) {
    if (this._isRequest(frame.type)) {
      const leaseError = this._useLeaseOrError(this._responderLeaseHandler);
      if (leaseError) {
        this._sendStreamError(streamId, leaseError);
        return;
      }
    }
    switch (frame.type) {
      case _RSocketFrame.FRAME_TYPES.CANCEL:
        this._handleCancel(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_N:
        this._handleRequestN(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_FNF:
        this._handleFireAndForget(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_RESPONSE:
        this._handleRequestResponse(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_STREAM:
        this._handleRequestStream(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.REQUEST_CHANNEL:
        this._handleRequestChannel(streamId, frame);
        break;
      case _RSocketFrame.FRAME_TYPES.ERROR:
        const error = (0, _RSocketFrame.createErrorFromFrame)(frame);
        this._handleStreamError(streamId, error);
        break;
      case _RSocketFrame.FRAME_TYPES.PAYLOAD:
        const receiver = this._receivers.get(streamId);
        if (receiver != null) {
          if ((0, _RSocketFrame.isNext)(frame.flags)) {
            const payload = {
              data: this._serializers.data.deserialize(frame.data),
              metadata: this._serializers.metadata.deserialize(frame.metadata),
            };

            receiver.onNext(payload);
          }
          if ((0, _RSocketFrame.isComplete)(frame.flags)) {
            this._receivers.delete(streamId);
            receiver.onComplete();
          }
        }
        break;
      default:
        if (false) {}
        break;
    }
  }

  _handleCancel(streamId, frame) {
    const subscription = this._subscriptions.get(streamId);
    if (subscription) {
      subscription.cancel();
      this._subscriptions.delete(streamId);
    }
  }

  _handleRequestN(streamId, frame) {
    const subscription = this._subscriptions.get(streamId);
    if (subscription) {
      subscription.request(frame.requestN);
    }
  }

  _handleFireAndForget(streamId, frame) {
    const payload = this._deserializePayload(frame);
    this._requestHandler.fireAndForget(payload);
  }

  _handleRequestResponse(streamId, frame) {
    const payload = this._deserializePayload(frame);
    this._requestHandler.requestResponse(payload).subscribe({
      onComplete: (payload) => {
        this._sendStreamPayload(streamId, payload, true);
      },
      onError: (error) => this._sendStreamError(streamId, error.message),
      onSubscribe: (cancel) => {
        const subscription = {
          cancel,
          request: () => {},
        };

        this._subscriptions.set(streamId, subscription);
      },
    });
  }

  _handleRequestStream(streamId, frame) {
    const payload = this._deserializePayload(frame);
    this._requestHandler.requestStream(payload).subscribe({
      onComplete: () => this._sendStreamComplete(streamId),
      onError: (error) => this._sendStreamError(streamId, error.message),
      onNext: (payload) => this._sendStreamPayload(streamId, payload),
      onSubscribe: (subscription) => {
        this._subscriptions.set(streamId, subscription);
        subscription.request(frame.requestN);
      },
    });
  }

  _handleRequestChannel(streamId, frame) {
    const existingSubscription = this._subscriptions.get(streamId);
    if (existingSubscription) {
      //Likely a duplicate REQUEST_CHANNEL frame, ignore per spec
      return;
    }

    const payloads = new _rsocketFlowable.Flowable((subscriber) => {
      let firstRequest = true;

      subscriber.onSubscribe({
        cancel: () => {
          this._receivers.delete(streamId);
          const cancelFrame = {
            flags: 0,
            streamId,
            type: _RSocketFrame.FRAME_TYPES.CANCEL,
          };

          this._connection.sendOne(cancelFrame);
        },
        request: (n) => {
          if (n > _RSocketFrame.MAX_REQUEST_N) {
            n = _RSocketFrame.MAX_REQUEST_N;
          }
          if (firstRequest) {
            n--;
          }

          if (n > 0) {
            const requestNFrame = {
              flags: 0,
              requestN: n,
              streamId,
              type: _RSocketFrame.FRAME_TYPES.REQUEST_N,
            };

            this._connection.sendOne(requestNFrame);
          }
          //critically, if n is 0 now, that's okay because we eagerly decremented it
          if (firstRequest && n >= 0) {
            firstRequest = false;
            //release the initial frame we received in frame form due to map operator
            subscriber.onNext(frame);
          }
        },
      });
    }, _RSocketFrame.MAX_REQUEST_N);
    const framesToPayloads = new _rsocketFlowable.FlowableProcessor(
      payloads,
      (frame) => this._deserializePayload(frame)
    );

    this._receivers.set(streamId, framesToPayloads);

    this._requestHandler.requestChannel(framesToPayloads).subscribe({
      onComplete: () => this._sendStreamComplete(streamId),
      onError: (error) => this._sendStreamError(streamId, error.message),
      onNext: (payload) => this._sendStreamPayload(streamId, payload),
      onSubscribe: (subscription) => {
        this._subscriptions.set(streamId, subscription);
        subscription.request(frame.requestN);
      },
    });
  }

  _handleMetadataPush(frame) {
    const payload = this._deserializeMetadataPushPayload(frame);
    this._requestHandler.metadataPush(payload).subscribe({
      onComplete: () => {},
      onError: (error) => {},
      onSubscribe: (cancel) => {},
    });
  }

  _sendStreamComplete(streamId) {
    this._subscriptions.delete(streamId);
    this._connection.sendOne({
      data: null,
      flags: _RSocketFrame.FLAGS.COMPLETE,
      metadata: null,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
    });
  }

  _sendStreamError(streamId, errorMessage) {
    this._subscriptions.delete(streamId);
    this._connection.sendOne({
      code: _RSocketFrame.ERROR_CODES.APPLICATION_ERROR,
      flags: 0,
      message: errorMessage,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.ERROR,
    });

    const error = new Error(`terminated from the requester: ${errorMessage}`);
    this._handleStreamError(streamId, error);
  }

  _sendStreamPayload(streamId, payload, complete = false) {
    let flags = _RSocketFrame.FLAGS.NEXT;
    if (complete) {
      // eslint-disable-next-line no-bitwise
      flags |= _RSocketFrame.FLAGS.COMPLETE;
      this._subscriptions.delete(streamId);
    }
    const data = this._serializers.data.serialize(payload.data);
    const metadata = this._serializers.metadata.serialize(payload.metadata);
    this._connection.sendOne({
      data,
      flags,
      metadata,
      streamId,
      type: _RSocketFrame.FRAME_TYPES.PAYLOAD,
    });
  }

  _deserializePayload(frame) {
    return deserializePayload(this._serializers, frame);
  }

  _deserializeMetadataPushPayload(frame) {
    return deserializeMetadataPushPayload(this._serializers, frame);
  }

  /**
   * Handle an error specific to a stream.
   */
  _handleStreamError(streamId, error) {
    const receiver = this._receivers.get(streamId);
    if (receiver != null) {
      this._receivers.delete(streamId);
      receiver.onError(error);
    }
  }
}

function deserializePayload(serializers, frame) {
  return {
    data: serializers.data.deserialize(frame.data),
    metadata: serializers.metadata.deserialize(frame.metadata),
  };
}

function deserializeMetadataPushPayload(serializers, frame) {
  return {
    data: null,
    metadata: serializers.metadata.deserialize(frame.metadata),
  };
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketResumableTransport.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketResumableTransport.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");

var _rsocketTypes = __webpack_require__(/*! rsocket-types */ "../../node_modules/rsocket-types/build/index.js");

var _RSocketBinaryFraming = __webpack_require__(/*! ./RSocketBinaryFraming */ "../../node_modules/rsocket-core/build/RSocketBinaryFraming.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * NOTE: This implementation conforms to an upcoming version of the RSocket protocol
 *       and will not work with version 1.0 servers.
 *
 * An implementation of the DuplexConnection interface that supports automatic
 * resumption per the RSocket protocol.
 *
 * # Example
 *
 * Create a client instance:
 * ```
 * const client = new RSocketClient({
 *   ...,
 *   transport: new RSocketResumableTransport(
 *     () => new RSocketWebSocketClient(...), // provider for low-level transport instances
 *     {
 *       bufferSize: 10, // max number of sent & pending frames to buffer before failing
 *       resumeToken: 'abc123', // string to uniquely identify the session across connections
 *     }
 *   ),
 * })
 *
 * Open the connection. After this if the connection dies it will be auto-resumed:
 * ```
 * client.connect().subscribe(...);
 * ```
 *
 * Optionally, subscribe to the status of the connection:
 * ```
 * client.connectionStatus().subscribe(...);
 * ```
 *
 * # Implementation Notes
 *
 * This transport maintains:
 * - _currentConnection: a current low-level transport, which is null when not
 *   connected
 * - _sentFrames: a buffer of frames written to a low-level transport (which
 *   may or may not have been received by the server)
 * - _pendingFrames: a buffer of frames not yet written to the low-level
 *   connection, because they were sent while not connected.
 *
 * The initial connection is simple: connect using the low-level transport and
 * flush any _pendingFrames (write them and add them to _sentFrames).
 *
 * Thereafter if the low-level transport drops, this transport attempts resumption.
 * It obtains a fresh low-level transport from the given transport `source`
 * and attempts to connect. Once connected, it sends a RESUME frame and waits.
 * If RESUME_OK is received, _sentFrames and _pendingFrames are adjusted such
 * that:
 * - any frames the server has received are removed from _sentFrames
 * - the remaining frames are merged (in correct order) into _pendingFrames
 *
 * Then the connection proceeds as above, where all pending frames are flushed.
 * If anything other than RESUME_OK is received, resumption is considered to
 * have failed and the connection is set to the ERROR status.
 */
class RSocketResumableTransport {
  constructor(source, options, encoders) {
    (0, _Invariant.default)(
      options.bufferSize >= 0,
      'RSocketResumableTransport: bufferSize option must be >= 0, got `%s`.',
      options.bufferSize
    );

    this._encoders = encoders;
    this._bufferSize = options.bufferSize;
    this._sentFramesSize = 0;
    this._position = {
      client: 0,
      server: 0,
    };

    this._currentConnection = null;
    this._statusSubscription = null;
    this._receiveSubscription = null;
    this._receivers = new Set();
    this._resumeToken = options.resumeToken;
    this._sessionTimeoutMillis = options.sessionDurationSeconds * 1000;
    this._sessionTimeoutHandle = null;
    this._senders = new Set();
    this._sentFrames = [];
    this._setupFrame = null;
    this._source = source;
    this._status = _rsocketTypes.CONNECTION_STATUS.NOT_CONNECTED;
    this._statusSubscribers = new Set();
  }

  close() {
    this._close();
  }

  connect() {
    (0, _Invariant.default)(
      !this._isTerminated(),
      'RSocketResumableTransport: Cannot connect(), connection terminated (%s: %s).',
      this._status.kind,
      this._status.kind === 'ERROR' ? this._status.error.message : 'no message'
    );

    try {
      this._disconnect();
      this._currentConnection = null;
      this._receiveSubscription = null;
      this._statusSubscription = null;
      this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTING);
      const connection = this._source();
      connection.connectionStatus().subscribe({
        onNext: (status) => {
          if (status.kind === this._status.kind) {
            return;
          }
          if (status.kind === 'CONNECTED') {
            if (this._sessionTimeoutHandle) {
              clearTimeout(this._sessionTimeoutHandle);
              this._sessionTimeoutHandle = null;
            }
            //Setup
            if (this._setupFrame == null) {
              this._handleConnected(connection);
              //Resume
            } else {
              this._handleResume(connection);
            }
          } else if (this._isTerminationStatus(status)) {
            if (!this._sessionTimeoutHandle) {
              this._sessionTimeoutHandle = setTimeout(
                () => this._close(this._resumeTimeoutError()),
                this._sessionTimeoutMillis
              );
            }
            this._disconnect();
            this._setConnectionStatus(
              _rsocketTypes.CONNECTION_STATUS.NOT_CONNECTED
            );
          }
        },
        onSubscribe: (subscription) => {
          this._statusSubscription = subscription;
          subscription.request(Number.MAX_SAFE_INTEGER);
        },
      });

      connection.connect();
    } catch (error) {
      this._close(error);
    }
  }

  connectionStatus() {
    return new _rsocketFlowable.Flowable((subscriber) => {
      subscriber.onSubscribe({
        cancel: () => {
          this._statusSubscribers.delete(subscriber);
        },
        request: () => {
          this._statusSubscribers.add(subscriber);
          subscriber.onNext(this._status);
        },
      });
    });
  }

  receive() {
    return new _rsocketFlowable.Flowable((subject) => {
      let added = false;
      subject.onSubscribe({
        cancel: () => {
          this._receivers.delete(subject);
        },
        request: () => {
          if (!added) {
            added = true;
            this._receivers.add(subject);
          }
        },
      });
    });
  }

  sendOne(frame) {
    try {
      this._writeFrame(frame);
    } catch (error) {
      this._close(error);
    }
  }

  send(frames) {
    let subscription;
    frames.subscribe({
      onComplete: () => {
        subscription && this._senders.delete(subscription);
      },
      onError: (error) => {
        subscription && this._senders.delete(subscription);
        this._close(error);
      },
      onNext: (frame) => this._writeFrame(frame),
      onSubscribe: (_subscription) => {
        subscription = _subscription;
        this._senders.add(subscription);
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }

  _close(error) {
    if (this._isTerminated()) {
      return;
    }
    if (error) {
      this._setConnectionStatus({error, kind: 'ERROR'});
    } else {
      this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CLOSED);
    }
    const receivers = this._receivers;
    receivers.forEach((r) => r.onComplete());
    receivers.clear();

    const senders = this._senders;
    senders.forEach((s) => s.cancel());
    senders.clear();
    this._sentFrames.length = 0;

    this._disconnect();
  }

  _disconnect() {
    if (this._statusSubscription) {
      this._statusSubscription.cancel();
      this._statusSubscription = null;
    }
    if (this._receiveSubscription) {
      this._receiveSubscription.cancel();
      this._receiveSubscription = null;
    }
    if (this._currentConnection) {
      this._currentConnection.close();
      this._currentConnection = null;
    }
  }

  _handleConnected(connection) {
    this._currentConnection = connection;
    this._flushFrames();
    this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTED);
    connection.receive().subscribe({
      onNext: (frame) => {
        try {
          this._receiveFrame(frame);
        } catch (error) {
          this._close(error);
        }
      },
      onSubscribe: (subscription) => {
        this._receiveSubscription = subscription;
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }

  _handleResume(connection) {
    connection
      .receive()
      .take(1)
      .subscribe({
        onNext: (frame) => {
          try {
            if (frame.type === _RSocketFrame.FRAME_TYPES.RESUME_OK) {
              const {clientPosition} = frame;
              // clientPosition indicates which frames the server is missing:
              // - anything after that still needs to be sent
              // - anything before that can be discarded
              if (clientPosition < this._position.client) {
                // Invalid RESUME_OK frame: server asked for an older
                // client frame than is available
                this._close(this._nonResumableStateError());
                return;
              }
              // remove tail frames of total length = remoteImpliedPos-localPos
              let removeSize = clientPosition - this._position.client;
              let index = 0;
              while (removeSize > 0) {
                const frameSize = this._onReleasedTailFrame(
                  this._sentFrames[index]
                );

                if (!frameSize) {
                  this._close(this._absentLengthError(frame));
                  return;
                }
                removeSize -= frameSize;
                index++;
              }
              if (removeSize !== 0) {
                this._close(this._inconsistentImpliedPositionError());
                return;
              }
              // Drop sent frames that the server has received
              if (index > 0) {
                this._sentFrames.splice(0, index);
              }
              // Continue connecting, which will flush pending frames
              this._handleConnected(connection);
            } else {
              const error =
                frame.type === _RSocketFrame.FRAME_TYPES.ERROR
                  ? (0, _RSocketFrame.createErrorFromFrame)(frame)
                  : new Error(
                      'RSocketResumableTransport: Resumption failed for an ' +
                        'unspecified reason.'
                    );

              this._close(error);
            }
          } catch (error) {
            this._close(error);
          }
        },
        onSubscribe: (subscription) => {
          this._receiveSubscription = subscription;
          subscription.request(1);
        },
      });

    const setupFrame = this._setupFrame;
    (0, _Invariant.default)(
      setupFrame,
      'RSocketResumableTransport: Cannot resume, setup frame has not been sent.'
    );

    connection.sendOne({
      clientPosition: this._position.client,
      flags: 0,
      majorVersion: setupFrame.majorVersion,
      minorVersion: setupFrame.minorVersion,
      resumeToken: this._resumeToken,
      serverPosition: this._position.server,
      streamId: _RSocketFrame.CONNECTION_STREAM_ID,
      type: _RSocketFrame.FRAME_TYPES.RESUME,
    });
  }

  _absentLengthError(frame) {
    return new Error(
      'RSocketResumableTransport: absent frame.length for type ' + frame.type
    );
  }

  _inconsistentImpliedPositionError() {
    return new Error(
      'RSocketResumableTransport: local frames are inconsistent with remote implied position'
    );
  }

  _nonResumableStateError() {
    return new Error(
      'RSocketResumableTransport: resumption failed, server is ' +
        'missing frames that are no longer in the client buffer.'
    );
  }

  _resumeTimeoutError() {
    return new Error('RSocketResumableTransport: resumable session timed out');
  }

  _isTerminated() {
    return this._isTerminationStatus(this._status);
  }

  _isTerminationStatus(status) {
    const kind = status.kind;
    return kind === 'CLOSED' || kind === 'ERROR';
  }

  _setConnectionStatus(status) {
    if (status.kind === this._status.kind) {
      return;
    }
    this._status = status;
    this._statusSubscribers.forEach((subscriber) => subscriber.onNext(status));
  }

  _receiveFrame(frame) {
    if ((0, _RSocketFrame.isResumePositionFrameType)(frame.type)) {
      if (frame.length) {
        this._position.server += frame.length;
      }
    }
    // TODO: trim _sentFrames on KEEPALIVE frame
    this._receivers.forEach((subscriber) => subscriber.onNext(frame));
  }

  _flushFrames() {
    this._sentFrames.forEach((frame) => {
      const connection = this._currentConnection;
      if (connection) {
        connection.sendOne(frame);
      }
    });
  }

  _onReleasedTailFrame(frame) {
    const removedFrameSize = frame.length;
    if (removedFrameSize) {
      this._sentFramesSize -= removedFrameSize;
      this._position.client += removedFrameSize;
      return removedFrameSize;
    }
  }

  _writeFrame(frame) {
    // Ensure that SETUP frames contain the resume token
    if (frame.type === _RSocketFrame.FRAME_TYPES.SETUP) {
      frame = _objectSpread(
        _objectSpread({}, frame),
        {},
        {
          flags: frame.flags | _RSocketFrame.FLAGS.RESUME_ENABLE, // eslint-disable-line no-bitwise
          resumeToken: this._resumeToken,
        }
      );

      this._setupFrame = frame; // frame can only be a SetupFrame
    }
    frame.length = (0, _RSocketBinaryFraming.sizeOfFrame)(
      frame,
      this._encoders
    );
    // If connected, immediately write frames to the low-level transport
    // and consider them "sent". The resumption protocol will figure out
    // which frames may not have been received and recover.
    if ((0, _RSocketFrame.isResumePositionFrameType)(frame.type)) {
      let available = this._bufferSize - this._sentFramesSize;
      const frameSize = frame.length;
      if (frameSize) {
        // remove tail until there is space for new frame
        while (available < frameSize) {
          const removedFrame = this._sentFrames.shift();
          if (removedFrame) {
            const removedFrameSize = this._onReleasedTailFrame(removedFrame);
            if (!removedFrameSize) {
              this._close(this._absentLengthError(frame));
              return;
            }
            available += removedFrameSize;
          } else {
            break;
          }
        }
        if (available >= frameSize) {
          this._sentFrames.push(frame);
          this._sentFramesSize += frameSize;
        } else {
          this._position.client += frameSize;
        }
      } else {
        this._close(this._absentLengthError(frame));
        return;
      }
    }
    const currentConnection = this._currentConnection;
    if (currentConnection) {
      currentConnection.sendOne(frame);
    }
  }
}
exports["default"] = RSocketResumableTransport;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketSerialization.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketSerialization.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.IdentitySerializers = exports.IdentitySerializer = exports.JsonSerializers = exports.JsonSerializer = void 0;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

// JSON serializer
const JsonSerializer = {
  deserialize: (data) => {
    let str;
    if (data == null) {
      return null;
    } else if (typeof data === 'string') {
      str = data;
    } else if (_LiteBuffer.LiteBuffer.isBuffer(data)) {
      const buffer = data;
      str = buffer.toString('utf8');
    } else {
      const buffer = _LiteBuffer.LiteBuffer.from(data);
      str = buffer.toString('utf8');
    }
    return JSON.parse(str);
  },
  serialize: JSON.stringify,
};
exports.JsonSerializer = JsonSerializer;

const JsonSerializers = {
  data: JsonSerializer,
  metadata: JsonSerializer,
};

// Pass-through serializer
exports.JsonSerializers = JsonSerializers;
const IdentitySerializer = {
  deserialize: (data) => {
    (0, _Invariant.default)(
      data == null ||
        typeof data === 'string' ||
        _LiteBuffer.LiteBuffer.isBuffer(data) ||
        data instanceof Uint8Array,
      'RSocketSerialization: Expected data to be a string, Buffer, or ' +
        'Uint8Array. Got `%s`.',
      data
    );

    return data;
  },
  serialize: (data) => data,
};
exports.IdentitySerializer = IdentitySerializer;

const IdentitySerializers = {
  data: IdentitySerializer,
  metadata: IdentitySerializer,
};
exports.IdentitySerializers = IdentitySerializers;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketServer.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketServer.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-core/build/Invariant.js"));
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");

var _RSocketSerialization = __webpack_require__(/*! ./RSocketSerialization */ "../../node_modules/rsocket-core/build/RSocketSerialization.js");
var _RSocketMachine = __webpack_require__(/*! ./RSocketMachine */ "../../node_modules/rsocket-core/build/RSocketMachine.js");
var _RSocketLease = __webpack_require__(/*! ./RSocketLease */ "../../node_modules/rsocket-core/build/RSocketLease.js");

var _ReassemblyDuplexConnection = __webpack_require__(/*! ./ReassemblyDuplexConnection */ "../../node_modules/rsocket-core/build/ReassemblyDuplexConnection.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * RSocketServer: A server in an RSocket connection that accepts connections
 * from peers via the given transport server.
 */
class RSocketServer {
  constructor(config) {
    _defineProperty(
      this,
      '_handleTransportComplete',

      () => {
        this._handleTransportError(
          new Error('RSocketServer: Connection closed unexpectedly.')
        );
      }
    );
    _defineProperty(
      this,
      '_handleTransportError',

      (error) => {
        this._connections.forEach((connection) => {
          // TODO: Allow passing in error
          connection.close();
        });
      }
    );
    _defineProperty(
      this,
      '_handleTransportConnection',

      (connection) => {
        const swapper = new SubscriberSwapper();
        let subscription;
        connection = new _ReassemblyDuplexConnection.ReassemblyDuplexConnection(
          connection
        );
        connection.receive().subscribe(
          swapper.swap({
            onError: (error) => console.error(error),
            onNext: (frame) => {
              switch (frame.type) {
                case _RSocketFrame.FRAME_TYPES.RESUME:
                  connection.sendOne({
                    code: _RSocketFrame.ERROR_CODES.REJECTED_RESUME,
                    flags: 0,
                    message: 'RSocketServer: RESUME not supported.',
                    streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                    type: _RSocketFrame.FRAME_TYPES.ERROR,
                  });

                  connection.close();
                  break;
                case _RSocketFrame.FRAME_TYPES.SETUP:
                  if (this._setupLeaseError(frame)) {
                    connection.sendOne({
                      code: _RSocketFrame.ERROR_CODES.INVALID_SETUP,
                      flags: 0,
                      message: 'RSocketServer: LEASE not supported.',
                      streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                      type: _RSocketFrame.FRAME_TYPES.ERROR,
                    });

                    connection.close();
                    break;
                  }
                  const serializers = this._getSerializers();

                  let requesterLeaseHandler;
                  let responderLeaseHandler;

                  const leasesSupplier = this._config.leases;
                  if (leasesSupplier) {
                    const lease = leasesSupplier();
                    requesterLeaseHandler = new _RSocketLease.RequesterLeaseHandler(
                      lease._receiver
                    );

                    responderLeaseHandler = new _RSocketLease.ResponderLeaseHandler(
                      lease._sender,
                      lease._stats
                    );
                  }
                  const serverMachine = (0,
                  _RSocketMachine.createServerMachine)(
                    connection,
                    (subscriber) => {
                      swapper.swap(subscriber);
                    },
                    frame.lifetime,
                    serializers,
                    this._config.errorHandler,
                    requesterLeaseHandler,
                    responderLeaseHandler
                  );

                  try {
                    const requestHandler = this._config.getRequestHandler(
                      serverMachine,
                      deserializePayload(serializers, frame)
                    );

                    serverMachine.setRequestHandler(requestHandler);
                    this._connections.add(serverMachine);
                    connection.connectionStatus().subscribe({
                      onNext: (status) => {
                        if (
                          status.kind === 'CLOSED' ||
                          status.kind === 'ERROR'
                        ) {
                          this._connections.delete(serverMachine);
                        }
                      },
                      onSubscribe: (subscription) =>
                        subscription.request(Number.MAX_SAFE_INTEGER),
                    });
                  } catch (error) {
                    connection.sendOne({
                      code: _RSocketFrame.ERROR_CODES.REJECTED_SETUP,
                      flags: 0,
                      message:
                        'Application rejected setup, reason: ' + error.message,
                      streamId: _RSocketFrame.CONNECTION_STREAM_ID,
                      type: _RSocketFrame.FRAME_TYPES.ERROR,
                    });

                    connection.close();
                  }
                  break;
                default:
                  (0, _Invariant.default)(
                    false,
                    'RSocketServer: Expected first frame to be SETUP or RESUME, ' +
                      'got `%s`.',
                    (0, _RSocketFrame.getFrameTypeName)(frame.type)
                  );
              }
            },
            onSubscribe: (_subscription) => {
              subscription = _subscription;
              subscription.request(1);
            },
          })
        );
      }
    );
    this._config = config;
    this._connections = new Set();
    this._started = false;
    this._subscription = null;
  }
  start() {
    (0, _Invariant.default)(
      !this._started,
      'RSocketServer: Unexpected call to start(), already started.'
    );
    this._started = true;
    this._config.transport.start().subscribe({
      onComplete: this._handleTransportComplete,
      onError: this._handleTransportError,
      onNext: this._handleTransportConnection,
      onSubscribe: (subscription) => {
        this._subscription = subscription;
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }
  stop() {
    if (this._subscription) {
      this._subscription.cancel();
    }
    this._config.transport.stop();
    this._handleTransportError(
      new Error('RSocketServer: Connection terminated via stop().')
    );
  }

  _getSerializers() {
    return (
      this._config.serializers || _RSocketSerialization.IdentitySerializers
    );
  }

  _setupLeaseError(frame) {
    const clientLeaseEnabled =
      (frame.flags & _RSocketFrame.FLAGS.LEASE) === _RSocketFrame.FLAGS.LEASE;
    const serverLeaseEnabled = this._config.leases;
    return clientLeaseEnabled && !serverLeaseEnabled;
  }
}
exports["default"] = RSocketServer;

class SubscriberSwapper {
  constructor(target) {
    this._target = target;
  }

  swap(next) {
    this._target = next;
    if (this._subscription) {
      this._target.onSubscribe && this._target.onSubscribe(this._subscription);
    }
    return this;
  }

  onComplete() {
    (0, _Invariant.default)(this._target, 'must have target');
    this._target.onComplete && this._target.onComplete();
  }
  onError(error) {
    (0, _Invariant.default)(this._target, 'must have target');
    this._target.onError && this._target.onError(error);
  }
  onNext(value) {
    (0, _Invariant.default)(this._target, 'must have target');
    this._target.onNext && this._target.onNext(value);
  }
  onSubscribe(subscription) {
    (0, _Invariant.default)(this._target, 'must have target');
    this._subscription = subscription;
    this._target.onSubscribe && this._target.onSubscribe(subscription);
  }
}

function deserializePayload(serializers, frame) {
  return {
    data: serializers.data.deserialize(frame.data),
    metadata: serializers.metadata.deserialize(frame.metadata),
  };
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RSocketVersion.js":
/*!***************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RSocketVersion.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports.MINOR_VERSION = exports.MAJOR_VERSION = void 0;

const MAJOR_VERSION = 1;
exports.MAJOR_VERSION = MAJOR_VERSION;
const MINOR_VERSION = 0;
exports.MINOR_VERSION = MINOR_VERSION;


/***/ }),

/***/ "../../node_modules/rsocket-core/build/ReassemblyDuplexConnection.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/ReassemblyDuplexConnection.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.ReassemblyDuplexConnection = void 0;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");
var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class ReassemblyDuplexConnection {
  constructor(source) {
    this._source = source;
  }

  sendOne(frame) {
    this._source.sendOne(frame);
  }

  send(input) {
    this._source.send(input);
  }

  receive() {
    return this._source
      .receive()
      .lift((actual) => new ReassemblySubscriber(actual));
  }

  close() {
    this._source.close();
  }

  connect() {
    this._source.connect();
  }

  connectionStatus() {
    return this._source.connectionStatus();
  }
}
exports.ReassemblyDuplexConnection = ReassemblyDuplexConnection;

class ReassemblySubscriber {
  constructor(actual) {
    _defineProperty(this, '_framesReassemblyMap', new Map());
    this._actual = actual;
  }

  request(n) {
    this._subscription.request(n);
  }

  cancel() {
    this._subscription.cancel();
    this._framesReassemblyMap.clear();
  }

  onSubscribe(s) {
    if (this._subscription == null) {
      this._subscription = s;
      this._actual.onSubscribe(this);
    } else {
      s.cancel();
    }
  }

  onComplete() {
    this._actual.onComplete();
  }

  onError(error) {
    this._actual.onError(error);
  }

  onNext(frame) {
    const streamId = frame.streamId;
    if (streamId !== _RSocketFrame.CONNECTION_STREAM_ID) {
      const hasFollowsFlag = (0, _RSocketFrame.isFollows)(frame.flags);
      const hasCompleteFlag = (0, _RSocketFrame.isComplete)(frame.flags);
      const isCancelOrError =
        frame.type === _RSocketFrame.FRAME_TYPES.ERROR ||
        frame.type === _RSocketFrame.FRAME_TYPES.CANCEL;

      const storedFrame = this._framesReassemblyMap.get(streamId);
      if (storedFrame) {
        if (isCancelOrError) {
          this._framesReassemblyMap.delete(streamId);
        } else {
          if (storedFrame.metadata && frame.metadata) {
            storedFrame.metadata = concatContent(
              storedFrame.metadata,
              frame.metadata
            );
          }

          if (storedFrame.data && frame.data) {
            storedFrame.data = concatContent(storedFrame.data, frame.data);
          } else if (!storedFrame.data && frame.data) {
            storedFrame.data = frame.data;
          }

          if (!hasFollowsFlag || hasCompleteFlag) {
            if (hasCompleteFlag) {
              storedFrame.flags |= _RSocketFrame.FLAGS.COMPLETE;
            }

            this._framesReassemblyMap.delete(streamId);
            this._actual.onNext(storedFrame);
          }

          return;
        }
      } else if (hasFollowsFlag && !hasCompleteFlag && !isCancelOrError) {
        this._framesReassemblyMap.set(streamId, frame);

        return;
      }
    }

    this._actual.onNext(frame);
  }
}

const concatContent = (a, b) => {
  switch (a.constructor.name) {
    case 'String':
      return a + b;
    case 'Uint8Array':
      const result = new Uint8Array(a.length + b.length);
      result.set(a);
      result.set(b, a.length);
      return result;
    default:
      return _LiteBuffer.LiteBuffer.concat([a, b]);
  }
};


/***/ }),

/***/ "../../node_modules/rsocket-core/build/RoutingMetadata.js":
/*!****************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/RoutingMetadata.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.encodeRoutes = encodeRoutes;
exports.encodeRoute = encodeRoute;
exports.decodeRoutes = decodeRoutes;
exports.RoutingMetadata = void 0;

var _LiteBuffer = __webpack_require__(/*! ./LiteBuffer */ "../../node_modules/rsocket-core/build/LiteBuffer.js");
var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js"); // $FlowFixMe

// $FlowFixMe
class RoutingMetadata {
  constructor(buffer) {
    this._buffer = buffer;
  }

  iterator() {
    return decodeRoutes(this._buffer);
  }

  // $FlowFixMe
  [Symbol.iterator]() {
    return decodeRoutes(this._buffer);
  }
}

/**
 * Encode given set of routes into {@link Buffer} following the <a href="https://github.com/rsocket/rsocket/blob/master/Extensions/Routing.md">Routing Metadata Layout</a>
 *
 * @param routes non-empty set of routes
 * @returns {Buffer} with encoded content
 */ exports.RoutingMetadata = RoutingMetadata;
function encodeRoutes(...routes) {
  if (routes.length < 1) {
    throw new Error('routes should be non empty array');
  }

  return _LiteBuffer.LiteBuffer.concat(
    routes.map((route) => encodeRoute(route))
  );
}

function encodeRoute(route) {
  const encodedRoute = (0, _RSocketBufferUtils.toBuffer)(route, 'utf8');

  if (encodedRoute.length > 255) {
    throw new Error(
      `route length should fit into unsigned byte length but the given one is ${encodedRoute.length}`
    );
  }

  const encodedLength = (0, _RSocketBufferUtils.createBuffer)(1);

  encodedLength.writeUInt8(encodedRoute.length);

  return _LiteBuffer.LiteBuffer.concat([encodedLength, encodedRoute]);
}

function* decodeRoutes(routeMetadataBuffer) {
  const length = routeMetadataBuffer.byteLength;
  let offset = 0;

  while (offset < length) {
    const routeLength = routeMetadataBuffer.readUInt8(offset++);

    if (offset + routeLength > length) {
      throw new Error(
        `Malformed RouteMetadata. Offset(${offset}) + RouteLength(${routeLength}) is greater than TotalLength`
      );
    }

    const route = routeMetadataBuffer.toString(
      'utf8',
      offset,
      offset + routeLength
    );

    offset += routeLength;
    yield route;
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/WellKnownAuthType.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/WellKnownAuthType.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.TYPES_BY_AUTH_STRING = exports.TYPES_BY_AUTH_ID = exports.BEARER = exports.SIMPLE = exports.UNKNOWN_RESERVED_AUTH_TYPE = exports.UNPARSEABLE_AUTH_TYPE = exports["default"] = void 0;

class WellKnownAuthType {
  constructor(str, identifier) {
    this._string = str;
    this._identifier = identifier;
  }

  /**
   * Find the {@link WellKnownAuthType} for the given identifier (as an {@link number}). Valid
   * identifiers are defined to be integers between 0 and 127, inclusive. Identifiers outside of
   * this range will produce the {@link #UNPARSEABLE_AUTH_TYPE}. Additionally, some identifiers in
   * that range are still only reserved and don't have a type associated yet: this method returns
   * the {@link #UNKNOWN_RESERVED_AUTH_TYPE} when passing such an identifier, which lets call sites
   * potentially detect this and keep the original representation when transmitting the associated
   * metadata buffer.
   *
   * @param id the looked up identifier
   * @return the {@link WellKnownAuthType}, or {@link #UNKNOWN_RESERVED_AUTH_TYPE} if the id is out
   *     of the specification's range, or {@link #UNKNOWN_RESERVED_AUTH_TYPE} if the id is one that
   *     is merely reserved but unknown to this implementation.
   */
  static fromIdentifier(id) {
    if (id < 0x00 || id > 0x7f) {
      return UNPARSEABLE_AUTH_TYPE;
    }
    return TYPES_BY_AUTH_ID[id];
  }

  /**
   * Find the {@link WellKnownAuthType} for the given {@link String} representation. If the
   * representation is {@code null} or doesn't match a {@link WellKnownAuthType}, the {@link
   * #UNPARSEABLE_AUTH_TYPE} is returned.
   *
   * @param authTypeString the looked up mime type
   * @return the matching {@link WellKnownAuthType}, or {@link #UNPARSEABLE_AUTH_TYPE} if none
   *     matches
   */
  static fromString(authTypeString) {
    if (!authTypeString) {
      throw new Error('type must be non-null');
    }

    // force UNPARSEABLE if by chance UNKNOWN_RESERVED_MIME_TYPE's text has been used
    if (authTypeString === UNKNOWN_RESERVED_AUTH_TYPE.string) {
      return UNPARSEABLE_AUTH_TYPE;
    }

    return TYPES_BY_AUTH_STRING.get(authTypeString) || UNPARSEABLE_AUTH_TYPE;
  }

  /** @return the byte identifier of the mime type, guaranteed to be positive or zero. */
  get identifier() {
    return this._identifier;
  }

  /**
   * @return the mime type represented as a {@link String}, which is made of US_ASCII compatible
   *     characters only
   */
  get string() {
    return this._string;
  }

  /** @see #string() */
  toString() {
    return this._string;
  }
}
exports["default"] = WellKnownAuthType;

const UNPARSEABLE_AUTH_TYPE = new WellKnownAuthType(
  'UNPARSEABLE_AUTH_TYPE_DO_NOT_USE',
  -2
);
exports.UNPARSEABLE_AUTH_TYPE = UNPARSEABLE_AUTH_TYPE;

const UNKNOWN_RESERVED_AUTH_TYPE = new WellKnownAuthType(
  'UNKNOWN_YET_RESERVED_DO_NOT_USE',
  -1
);
exports.UNKNOWN_RESERVED_AUTH_TYPE = UNKNOWN_RESERVED_AUTH_TYPE;

const SIMPLE = new WellKnownAuthType('simple', 0x00);
exports.SIMPLE = SIMPLE;
const BEARER = new WellKnownAuthType('bearer', 0x01);
exports.BEARER = BEARER;

const TYPES_BY_AUTH_ID = new Array(128);
exports.TYPES_BY_AUTH_ID = TYPES_BY_AUTH_ID;
const TYPES_BY_AUTH_STRING = new Map();
exports.TYPES_BY_AUTH_STRING = TYPES_BY_AUTH_STRING;

const ALL_MIME_TYPES = [
  UNPARSEABLE_AUTH_TYPE,
  UNKNOWN_RESERVED_AUTH_TYPE,
  SIMPLE,
  BEARER,
];

TYPES_BY_AUTH_ID.fill(UNKNOWN_RESERVED_AUTH_TYPE);

for (const value of ALL_MIME_TYPES) {
  if (value.identifier >= 0) {
    TYPES_BY_AUTH_ID[value.identifier] = value;
    TYPES_BY_AUTH_STRING.set(value.string, value);
  }
}

if (Object.seal) {
  Object.seal(TYPES_BY_AUTH_ID);
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/WellKnownMimeType.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rsocket-core/build/WellKnownMimeType.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.TYPES_BY_MIME_STRING = exports.TYPES_BY_MIME_ID = exports.MESSAGE_RSOCKET_COMPOSITE_METADATA = exports.MESSAGE_RSOCKET_ROUTING = exports.MESSAGE_RSOCKET_TRACING_ZIPKIN = exports.MESSAGE_RSOCKET_AUTHENTICATION = exports.MESSAGE_RSOCKET_ACCEPT_MIMETYPES = exports.MESSAGE_RSOCKET_MIMETYPE = exports.APPLICATION_CLOUDEVENTS_JSON = exports.APPLICATION_JAVA_OBJECT = exports.APPLICATION_HESSIAN = exports.VIDEO_VP8 = exports.VIDEO_H265 = exports.VIDEO_H264 = exports.TEXT_XML = exports.TEXT_PLAIN = exports.TEXT_HTML = exports.TEXT_CSV = exports.TEXT_CSS = exports.MULTIPART_MIXED = exports.IMAGE_TIFF = exports.IMAGE_PNG = exports.IMAGE_JPEG = exports.IMAGE_HEIF = exports.IMAGE_HEIF_SEQUENCE = exports.IMAGE_HEIC = exports.IMAGE_HEIC_SEQUENCE = exports.IMAGE_GIG = exports.IMAGE_BMP = exports.AUDIO_VORBIS = exports.AUDIO_OPUS = exports.AUDIO_OGG = exports.AUDIO_MPEG = exports.AUDIO_MPEG3 = exports.AUDIO_MP4 = exports.AUDIO_MP3 = exports.AUDIO_AAC = exports.APPLICATION_ZIP = exports.APPLICATION_XML = exports.APPLICATION_PROTOBUF = exports.APPLICATION_THRIFT = exports.APPLICATION_PDF = exports.APPLICATION_OCTET_STREAM = exports.APPLICATION_JSON = exports.APPLICATION_JAVASCRIPT = exports.APPLICATION_GZIP = exports.APPLICATION_GRAPHQL = exports.APPLICATION_CBOR = exports.APPLICATION_AVRO = exports.UNKNOWN_RESERVED_MIME_TYPE = exports.UNPARSEABLE_MIME_TYPE = exports["default"] = void 0;

class WellKnownMimeType {
  constructor(str, identifier) {
    this._string = str;
    this._identifier = identifier;
  }

  /**
   * Find the {@link WellKnownMimeType} for the given identifier (as an {@code int}). Valid
   * identifiers are defined to be integers between 0 and 127, inclusive. Identifiers outside of
   * this range will produce the {@link #UNPARSEABLE_MIME_TYPE}. Additionally, some identifiers in
   * that range are still only reserved and don't have a type associated yet: this method returns
   * the {@link #UNKNOWN_RESERVED_MIME_TYPE} when passing such an identifier, which lets call sites
   * potentially detect this and keep the original representation when transmitting the associated
   * metadata buffer.
   *
   * @param id the looked up identifier
   * @return the {@link WellKnownMimeType}, or {@link #UNKNOWN_RESERVED_MIME_TYPE} if the id is out
   *     of the specification's range, or {@link #UNKNOWN_RESERVED_MIME_TYPE} if the id is one that
   *     is merely reserved but unknown to this implementation.
   */
  static fromIdentifier(id) {
    if (id < 0x00 || id > 0x7f) {
      return UNPARSEABLE_MIME_TYPE;
    }
    return TYPES_BY_MIME_ID[id];
  }

  /**
   * Find the {@link WellKnownMimeType} for the given {@link String} representation. If the
   * representation is {@code null} or doesn't match a {@link WellKnownMimeType}, the {@link
   * #UNPARSEABLE_MIME_TYPE} is returned.
   *
   * @param mimeType the looked up mime type
   * @return the matching {@link WellKnownMimeType}, or {@link #UNPARSEABLE_MIME_TYPE} if none
   *     matches
   */
  static fromString(mimeType) {
    if (!mimeType) {
      throw new Error('type must be non-null');
    }

    // force UNPARSEABLE if by chance UNKNOWN_RESERVED_MIME_TYPE's text has been used
    if (mimeType === UNKNOWN_RESERVED_MIME_TYPE.string) {
      return UNPARSEABLE_MIME_TYPE;
    }

    return TYPES_BY_MIME_STRING.get(mimeType) || UNPARSEABLE_MIME_TYPE;
  }

  /** @return the byte identifier of the mime type, guaranteed to be positive or zero. */
  get identifier() {
    return this._identifier;
  }

  /**
   * @return the mime type represented as a {@link String}, which is made of US_ASCII compatible
   *     characters only
   */
  get string() {
    return this._string;
  }

  /** @see #getString() */
  toString() {
    return this._string;
  }
}
exports["default"] = WellKnownMimeType;

const UNPARSEABLE_MIME_TYPE = new WellKnownMimeType(
  'UNPARSEABLE_MIME_TYPE_DO_NOT_USE',
  -2
);
exports.UNPARSEABLE_MIME_TYPE = UNPARSEABLE_MIME_TYPE;

const UNKNOWN_RESERVED_MIME_TYPE = new WellKnownMimeType(
  'UNKNOWN_YET_RESERVED_DO_NOT_USE',
  -1
);
exports.UNKNOWN_RESERVED_MIME_TYPE = UNKNOWN_RESERVED_MIME_TYPE;

const APPLICATION_AVRO = new WellKnownMimeType('application/avro', 0x00);
exports.APPLICATION_AVRO = APPLICATION_AVRO;

const APPLICATION_CBOR = new WellKnownMimeType('application/cbor', 0x01);
exports.APPLICATION_CBOR = APPLICATION_CBOR;

const APPLICATION_GRAPHQL = new WellKnownMimeType('application/graphql', 0x02);
exports.APPLICATION_GRAPHQL = APPLICATION_GRAPHQL;

const APPLICATION_GZIP = new WellKnownMimeType('application/gzip', 0x03);
exports.APPLICATION_GZIP = APPLICATION_GZIP;

const APPLICATION_JAVASCRIPT = new WellKnownMimeType(
  'application/javascript',
  0x04
);
exports.APPLICATION_JAVASCRIPT = APPLICATION_JAVASCRIPT;

const APPLICATION_JSON = new WellKnownMimeType('application/json', 0x05);
exports.APPLICATION_JSON = APPLICATION_JSON;

const APPLICATION_OCTET_STREAM = new WellKnownMimeType(
  'application/octet-stream',
  0x06
);
exports.APPLICATION_OCTET_STREAM = APPLICATION_OCTET_STREAM;

const APPLICATION_PDF = new WellKnownMimeType('application/pdf', 0x07);
exports.APPLICATION_PDF = APPLICATION_PDF;

const APPLICATION_THRIFT = new WellKnownMimeType(
  'application/vnd.apache.thrift.binary',
  0x08
);
exports.APPLICATION_THRIFT = APPLICATION_THRIFT;

const APPLICATION_PROTOBUF = new WellKnownMimeType(
  'application/vnd.google.protobuf',
  0x09
);
exports.APPLICATION_PROTOBUF = APPLICATION_PROTOBUF;

const APPLICATION_XML = new WellKnownMimeType('application/xml', 0x0a);
exports.APPLICATION_XML = APPLICATION_XML;

const APPLICATION_ZIP = new WellKnownMimeType('application/zip', 0x0b);
exports.APPLICATION_ZIP = APPLICATION_ZIP;

const AUDIO_AAC = new WellKnownMimeType('audio/aac', 0x0c);
exports.AUDIO_AAC = AUDIO_AAC;

const AUDIO_MP3 = new WellKnownMimeType('audio/mp3', 0x0d);
exports.AUDIO_MP3 = AUDIO_MP3;

const AUDIO_MP4 = new WellKnownMimeType('audio/mp4', 0x0e);
exports.AUDIO_MP4 = AUDIO_MP4;

const AUDIO_MPEG3 = new WellKnownMimeType('audio/mpeg3', 0x0f);
exports.AUDIO_MPEG3 = AUDIO_MPEG3;

const AUDIO_MPEG = new WellKnownMimeType('audio/mpeg', 0x10);
exports.AUDIO_MPEG = AUDIO_MPEG;

const AUDIO_OGG = new WellKnownMimeType('audio/ogg', 0x11);
exports.AUDIO_OGG = AUDIO_OGG;

const AUDIO_OPUS = new WellKnownMimeType('audio/opus', 0x12);
exports.AUDIO_OPUS = AUDIO_OPUS;

const AUDIO_VORBIS = new WellKnownMimeType('audio/vorbis', 0x13);
exports.AUDIO_VORBIS = AUDIO_VORBIS;

const IMAGE_BMP = new WellKnownMimeType('image/bmp', 0x14);
exports.IMAGE_BMP = IMAGE_BMP;

const IMAGE_GIG = new WellKnownMimeType('image/gif', 0x15);
exports.IMAGE_GIG = IMAGE_GIG;

const IMAGE_HEIC_SEQUENCE = new WellKnownMimeType('image/heic-sequence', 0x16);
exports.IMAGE_HEIC_SEQUENCE = IMAGE_HEIC_SEQUENCE;

const IMAGE_HEIC = new WellKnownMimeType('image/heic', 0x17);
exports.IMAGE_HEIC = IMAGE_HEIC;

const IMAGE_HEIF_SEQUENCE = new WellKnownMimeType('image/heif-sequence', 0x18);
exports.IMAGE_HEIF_SEQUENCE = IMAGE_HEIF_SEQUENCE;

const IMAGE_HEIF = new WellKnownMimeType('image/heif', 0x19);
exports.IMAGE_HEIF = IMAGE_HEIF;

const IMAGE_JPEG = new WellKnownMimeType('image/jpeg', 0x1a);
exports.IMAGE_JPEG = IMAGE_JPEG;

const IMAGE_PNG = new WellKnownMimeType('image/png', 0x1b);
exports.IMAGE_PNG = IMAGE_PNG;

const IMAGE_TIFF = new WellKnownMimeType('image/tiff', 0x1c);
exports.IMAGE_TIFF = IMAGE_TIFF;

const MULTIPART_MIXED = new WellKnownMimeType('multipart/mixed', 0x1d);
exports.MULTIPART_MIXED = MULTIPART_MIXED;

const TEXT_CSS = new WellKnownMimeType('text/css', 0x1e);
exports.TEXT_CSS = TEXT_CSS;

const TEXT_CSV = new WellKnownMimeType('text/csv', 0x1f);
exports.TEXT_CSV = TEXT_CSV;

const TEXT_HTML = new WellKnownMimeType('text/html', 0x20);
exports.TEXT_HTML = TEXT_HTML;

const TEXT_PLAIN = new WellKnownMimeType('text/plain', 0x21);
exports.TEXT_PLAIN = TEXT_PLAIN;

const TEXT_XML = new WellKnownMimeType('text/xml', 0x22);
exports.TEXT_XML = TEXT_XML;

const VIDEO_H264 = new WellKnownMimeType('video/H264', 0x23);
exports.VIDEO_H264 = VIDEO_H264;

const VIDEO_H265 = new WellKnownMimeType('video/H265', 0x24);
exports.VIDEO_H265 = VIDEO_H265;

const VIDEO_VP8 = new WellKnownMimeType('video/VP8', 0x25);
exports.VIDEO_VP8 = VIDEO_VP8;

const APPLICATION_HESSIAN = new WellKnownMimeType(
  'application/x-hessian',
  0x26
);
exports.APPLICATION_HESSIAN = APPLICATION_HESSIAN;

const APPLICATION_JAVA_OBJECT = new WellKnownMimeType(
  'application/x-java-object',
  0x27
);
exports.APPLICATION_JAVA_OBJECT = APPLICATION_JAVA_OBJECT;

const APPLICATION_CLOUDEVENTS_JSON = new WellKnownMimeType(
  'application/cloudevents+json',
  0x28
);

// ... reserved for future use ...
exports.APPLICATION_CLOUDEVENTS_JSON = APPLICATION_CLOUDEVENTS_JSON;
const MESSAGE_RSOCKET_MIMETYPE = new WellKnownMimeType(
  'message/x.rsocket.mime-type.v0',
  0x7a
);
exports.MESSAGE_RSOCKET_MIMETYPE = MESSAGE_RSOCKET_MIMETYPE;

const MESSAGE_RSOCKET_ACCEPT_MIMETYPES = new WellKnownMimeType(
  'message/x.rsocket.accept-mime-types.v0',
  0x7b
);
exports.MESSAGE_RSOCKET_ACCEPT_MIMETYPES = MESSAGE_RSOCKET_ACCEPT_MIMETYPES;

const MESSAGE_RSOCKET_AUTHENTICATION = new WellKnownMimeType(
  'message/x.rsocket.authentication.v0',
  0x7c
);
exports.MESSAGE_RSOCKET_AUTHENTICATION = MESSAGE_RSOCKET_AUTHENTICATION;

const MESSAGE_RSOCKET_TRACING_ZIPKIN = new WellKnownMimeType(
  'message/x.rsocket.tracing-zipkin.v0',
  0x7d
);
exports.MESSAGE_RSOCKET_TRACING_ZIPKIN = MESSAGE_RSOCKET_TRACING_ZIPKIN;

const MESSAGE_RSOCKET_ROUTING = new WellKnownMimeType(
  'message/x.rsocket.routing.v0',
  0x7e
);
exports.MESSAGE_RSOCKET_ROUTING = MESSAGE_RSOCKET_ROUTING;

const MESSAGE_RSOCKET_COMPOSITE_METADATA = new WellKnownMimeType(
  'message/x.rsocket.composite-metadata.v0',
  0x7f
);
exports.MESSAGE_RSOCKET_COMPOSITE_METADATA = MESSAGE_RSOCKET_COMPOSITE_METADATA;

const TYPES_BY_MIME_ID = new Array(128);
exports.TYPES_BY_MIME_ID = TYPES_BY_MIME_ID;
const TYPES_BY_MIME_STRING = new Map();
exports.TYPES_BY_MIME_STRING = TYPES_BY_MIME_STRING;

const ALL_MIME_TYPES = [
  UNPARSEABLE_MIME_TYPE,
  UNKNOWN_RESERVED_MIME_TYPE,
  APPLICATION_AVRO,
  APPLICATION_CBOR,
  APPLICATION_GRAPHQL,
  APPLICATION_GZIP,
  APPLICATION_JAVASCRIPT,
  APPLICATION_JSON,
  APPLICATION_OCTET_STREAM,
  APPLICATION_PDF,
  APPLICATION_THRIFT,
  APPLICATION_PROTOBUF,
  APPLICATION_XML,
  APPLICATION_ZIP,
  AUDIO_AAC,
  AUDIO_MP3,
  AUDIO_MP4,
  AUDIO_MPEG3,
  AUDIO_MPEG,
  AUDIO_OGG,
  AUDIO_OPUS,
  AUDIO_VORBIS,
  IMAGE_BMP,
  IMAGE_GIG,
  IMAGE_HEIC_SEQUENCE,
  IMAGE_HEIC,
  IMAGE_HEIF_SEQUENCE,
  IMAGE_HEIF,
  IMAGE_JPEG,
  IMAGE_PNG,
  IMAGE_TIFF,
  MULTIPART_MIXED,
  TEXT_CSS,
  TEXT_CSV,
  TEXT_HTML,
  TEXT_PLAIN,
  TEXT_XML,
  VIDEO_H264,
  VIDEO_H265,
  VIDEO_VP8,
  APPLICATION_HESSIAN,
  APPLICATION_JAVA_OBJECT,
  APPLICATION_CLOUDEVENTS_JSON,
  MESSAGE_RSOCKET_MIMETYPE,
  MESSAGE_RSOCKET_ACCEPT_MIMETYPES,
  MESSAGE_RSOCKET_AUTHENTICATION,
  MESSAGE_RSOCKET_TRACING_ZIPKIN,
  MESSAGE_RSOCKET_ROUTING,
  MESSAGE_RSOCKET_COMPOSITE_METADATA,
];

TYPES_BY_MIME_ID.fill(UNKNOWN_RESERVED_MIME_TYPE);

for (const value of ALL_MIME_TYPES) {
  if (value.identifier >= 0) {
    TYPES_BY_MIME_ID[value.identifier] = value;
    TYPES_BY_MIME_STRING.set(value.string, value);
  }
}

if (Object.seal) {
  Object.seal(TYPES_BY_MIME_ID);
}


/***/ }),

/***/ "../../node_modules/rsocket-core/build/index.js":
/*!******************************************************!*\
  !*** ../../node_modules/rsocket-core/build/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
Object.defineProperty(exports, "RSocketClient", ({
  enumerable: true,
  get: function () {
    return _RSocketClient.default;
  },
}));
Object.defineProperty(exports, "RSocketServer", ({
  enumerable: true,
  get: function () {
    return _RSocketServer.default;
  },
}));
Object.defineProperty(exports, "RSocketResumableTransport", ({
  enumerable: true,
  get: function () {
    return _RSocketResumableTransport.default;
  },
}));
Object.defineProperty(exports, "WellKnownMimeType", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.default;
  },
}));
Object.defineProperty(exports, "UNPARSEABLE_MIME_TYPE", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.UNPARSEABLE_MIME_TYPE;
  },
}));
Object.defineProperty(exports, "UNKNOWN_RESERVED_MIME_TYPE", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.UNKNOWN_RESERVED_MIME_TYPE;
  },
}));
Object.defineProperty(exports, "APPLICATION_AVRO", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_AVRO;
  },
}));
Object.defineProperty(exports, "APPLICATION_CBOR", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_CBOR;
  },
}));
Object.defineProperty(exports, "APPLICATION_GRAPHQL", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_GRAPHQL;
  },
}));
Object.defineProperty(exports, "APPLICATION_GZIP", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_GZIP;
  },
}));
Object.defineProperty(exports, "APPLICATION_JAVASCRIPT", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_JAVASCRIPT;
  },
}));
Object.defineProperty(exports, "APPLICATION_JSON", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_JSON;
  },
}));
Object.defineProperty(exports, "APPLICATION_OCTET_STREAM", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_OCTET_STREAM;
  },
}));
Object.defineProperty(exports, "APPLICATION_PDF", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_PDF;
  },
}));
Object.defineProperty(exports, "APPLICATION_THRIFT", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_THRIFT;
  },
}));
Object.defineProperty(exports, "APPLICATION_PROTOBUF", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_PROTOBUF;
  },
}));
Object.defineProperty(exports, "APPLICATION_XML", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_XML;
  },
}));
Object.defineProperty(exports, "APPLICATION_ZIP", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_ZIP;
  },
}));
Object.defineProperty(exports, "AUDIO_AAC", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_AAC;
  },
}));
Object.defineProperty(exports, "AUDIO_MP3", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_MP3;
  },
}));
Object.defineProperty(exports, "AUDIO_MP4", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_MP4;
  },
}));
Object.defineProperty(exports, "AUDIO_MPEG3", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_MPEG3;
  },
}));
Object.defineProperty(exports, "AUDIO_MPEG", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_MPEG;
  },
}));
Object.defineProperty(exports, "AUDIO_OGG", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_OGG;
  },
}));
Object.defineProperty(exports, "AUDIO_OPUS", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_OPUS;
  },
}));
Object.defineProperty(exports, "AUDIO_VORBIS", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.AUDIO_VORBIS;
  },
}));
Object.defineProperty(exports, "IMAGE_BMP", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_BMP;
  },
}));
Object.defineProperty(exports, "IMAGE_GIG", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_GIG;
  },
}));
Object.defineProperty(exports, "IMAGE_HEIC_SEQUENCE", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_HEIC_SEQUENCE;
  },
}));
Object.defineProperty(exports, "IMAGE_HEIC", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_HEIC;
  },
}));
Object.defineProperty(exports, "IMAGE_HEIF_SEQUENCE", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_HEIF_SEQUENCE;
  },
}));
Object.defineProperty(exports, "IMAGE_HEIF", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_HEIF;
  },
}));
Object.defineProperty(exports, "IMAGE_JPEG", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_JPEG;
  },
}));
Object.defineProperty(exports, "IMAGE_PNG", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_PNG;
  },
}));
Object.defineProperty(exports, "IMAGE_TIFF", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.IMAGE_TIFF;
  },
}));
Object.defineProperty(exports, "MULTIPART_MIXED", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MULTIPART_MIXED;
  },
}));
Object.defineProperty(exports, "TEXT_CSS", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.TEXT_CSS;
  },
}));
Object.defineProperty(exports, "TEXT_CSV", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.TEXT_CSV;
  },
}));
Object.defineProperty(exports, "TEXT_HTML", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.TEXT_HTML;
  },
}));
Object.defineProperty(exports, "TEXT_PLAIN", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.TEXT_PLAIN;
  },
}));
Object.defineProperty(exports, "TEXT_XML", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.TEXT_XML;
  },
}));
Object.defineProperty(exports, "VIDEO_H264", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.VIDEO_H264;
  },
}));
Object.defineProperty(exports, "VIDEO_H265", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.VIDEO_H265;
  },
}));
Object.defineProperty(exports, "VIDEO_VP8", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.VIDEO_VP8;
  },
}));
Object.defineProperty(exports, "APPLICATION_HESSIAN", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_HESSIAN;
  },
}));
Object.defineProperty(exports, "APPLICATION_JAVA_OBJECT", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_JAVA_OBJECT;
  },
}));
Object.defineProperty(exports, "APPLICATION_CLOUDEVENTS_JSON", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.APPLICATION_CLOUDEVENTS_JSON;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_MIMETYPE", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_MIMETYPE;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_ACCEPT_MIMETYPES", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_ACCEPT_MIMETYPES;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_AUTHENTICATION", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_AUTHENTICATION;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_TRACING_ZIPKIN", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_TRACING_ZIPKIN;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_ROUTING", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_ROUTING;
  },
}));
Object.defineProperty(exports, "MESSAGE_RSOCKET_COMPOSITE_METADATA", ({
  enumerable: true,
  get: function () {
    return _WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA;
  },
}));
Object.defineProperty(exports, "WellKnownAuthType", ({
  enumerable: true,
  get: function () {
    return _WellKnownAuthType.default;
  },
}));
Object.defineProperty(exports, "UNPARSEABLE_AUTH_TYPE", ({
  enumerable: true,
  get: function () {
    return _WellKnownAuthType.UNPARSEABLE_AUTH_TYPE;
  },
}));
Object.defineProperty(exports, "UNKNOWN_RESERVED_AUTH_TYPE", ({
  enumerable: true,
  get: function () {
    return _WellKnownAuthType.UNKNOWN_RESERVED_AUTH_TYPE;
  },
}));
Object.defineProperty(exports, "SIMPLE", ({
  enumerable: true,
  get: function () {
    return _WellKnownAuthType.SIMPLE;
  },
}));
Object.defineProperty(exports, "BEARER", ({
  enumerable: true,
  get: function () {
    return _WellKnownAuthType.BEARER;
  },
}));
Object.defineProperty(exports, "CONNECTION_STREAM_ID", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.CONNECTION_STREAM_ID;
  },
}));
Object.defineProperty(exports, "ERROR_CODES", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.ERROR_CODES;
  },
}));
Object.defineProperty(exports, "ERROR_EXPLANATIONS", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.ERROR_EXPLANATIONS;
  },
}));
Object.defineProperty(exports, "FLAGS_MASK", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.FLAGS_MASK;
  },
}));
Object.defineProperty(exports, "FLAGS", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.FLAGS;
  },
}));
Object.defineProperty(exports, "FRAME_TYPE_OFFFSET", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.FRAME_TYPE_OFFFSET;
  },
}));
Object.defineProperty(exports, "FRAME_TYPES", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.FRAME_TYPES;
  },
}));
Object.defineProperty(exports, "MAX_CODE", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_CODE;
  },
}));
Object.defineProperty(exports, "MAX_KEEPALIVE", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_KEEPALIVE;
  },
}));
Object.defineProperty(exports, "MAX_LIFETIME", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_LIFETIME;
  },
}));
Object.defineProperty(exports, "MAX_MIME_LENGTH", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_MIME_LENGTH;
  },
}));
Object.defineProperty(exports, "MAX_RESUME_LENGTH", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_RESUME_LENGTH;
  },
}));
Object.defineProperty(exports, "MAX_STREAM_ID", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_STREAM_ID;
  },
}));
Object.defineProperty(exports, "MAX_VERSION", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.MAX_VERSION;
  },
}));
Object.defineProperty(exports, "createErrorFromFrame", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.createErrorFromFrame;
  },
}));
Object.defineProperty(exports, "getErrorCodeExplanation", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.getErrorCodeExplanation;
  },
}));
Object.defineProperty(exports, "isComplete", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isComplete;
  },
}));
Object.defineProperty(exports, "isIgnore", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isIgnore;
  },
}));
Object.defineProperty(exports, "isLease", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isLease;
  },
}));
Object.defineProperty(exports, "isMetadata", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isMetadata;
  },
}));
Object.defineProperty(exports, "isNext", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isNext;
  },
}));
Object.defineProperty(exports, "isRespond", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isRespond;
  },
}));
Object.defineProperty(exports, "isResumeEnable", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.isResumeEnable;
  },
}));
Object.defineProperty(exports, "printFrame", ({
  enumerable: true,
  get: function () {
    return _RSocketFrame.printFrame;
  },
}));
Object.defineProperty(exports, "deserializeFrame", ({
  enumerable: true,
  get: function () {
    return _RSocketBinaryFraming.deserializeFrame;
  },
}));
Object.defineProperty(exports, "deserializeFrameWithLength", ({
  enumerable: true,
  get: function () {
    return _RSocketBinaryFraming.deserializeFrameWithLength;
  },
}));
Object.defineProperty(exports, "deserializeFrames", ({
  enumerable: true,
  get: function () {
    return _RSocketBinaryFraming.deserializeFrames;
  },
}));
Object.defineProperty(exports, "serializeFrame", ({
  enumerable: true,
  get: function () {
    return _RSocketBinaryFraming.serializeFrame;
  },
}));
Object.defineProperty(exports, "serializeFrameWithLength", ({
  enumerable: true,
  get: function () {
    return _RSocketBinaryFraming.serializeFrameWithLength;
  },
}));
Object.defineProperty(exports, "byteLength", ({
  enumerable: true,
  get: function () {
    return _RSocketBufferUtils.byteLength;
  },
}));
Object.defineProperty(exports, "createBuffer", ({
  enumerable: true,
  get: function () {
    return _RSocketBufferUtils.createBuffer;
  },
}));
Object.defineProperty(exports, "readUInt24BE", ({
  enumerable: true,
  get: function () {
    return _RSocketBufferUtils.readUInt24BE;
  },
}));
Object.defineProperty(exports, "toBuffer", ({
  enumerable: true,
  get: function () {
    return _RSocketBufferUtils.toBuffer;
  },
}));
Object.defineProperty(exports, "writeUInt24BE", ({
  enumerable: true,
  get: function () {
    return _RSocketBufferUtils.writeUInt24BE;
  },
}));
Object.defineProperty(exports, "BufferEncoders", ({
  enumerable: true,
  get: function () {
    return _RSocketEncoding.BufferEncoders;
  },
}));
Object.defineProperty(exports, "BufferEncoder", ({
  enumerable: true,
  get: function () {
    return _RSocketEncoding.BufferEncoder;
  },
}));
Object.defineProperty(exports, "Utf8Encoders", ({
  enumerable: true,
  get: function () {
    return _RSocketEncoding.Utf8Encoders;
  },
}));
Object.defineProperty(exports, "UTF8Encoder", ({
  enumerable: true,
  get: function () {
    return _RSocketEncoding.UTF8Encoder;
  },
}));
Object.defineProperty(exports, "IdentitySerializer", ({
  enumerable: true,
  get: function () {
    return _RSocketSerialization.IdentitySerializer;
  },
}));
Object.defineProperty(exports, "IdentitySerializers", ({
  enumerable: true,
  get: function () {
    return _RSocketSerialization.IdentitySerializers;
  },
}));
Object.defineProperty(exports, "JsonSerializer", ({
  enumerable: true,
  get: function () {
    return _RSocketSerialization.JsonSerializer;
  },
}));
Object.defineProperty(exports, "JsonSerializers", ({
  enumerable: true,
  get: function () {
    return _RSocketSerialization.JsonSerializers;
  },
}));
Object.defineProperty(exports, "Leases", ({
  enumerable: true,
  get: function () {
    return _RSocketLease.Leases;
  },
}));
Object.defineProperty(exports, "Lease", ({
  enumerable: true,
  get: function () {
    return _RSocketLease.Lease;
  },
}));
Object.defineProperty(exports, "CompositeMetadata", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.CompositeMetadata;
  },
}));
Object.defineProperty(exports, "ReservedMimeTypeEntry", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.ReservedMimeTypeEntry;
  },
}));
Object.defineProperty(exports, "WellKnownMimeTypeEntry", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.WellKnownMimeTypeEntry;
  },
}));
Object.defineProperty(exports, "ExplicitMimeTimeEntry", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.ExplicitMimeTimeEntry;
  },
}));
Object.defineProperty(exports, "encodeAndAddCustomMetadata", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.encodeAndAddCustomMetadata;
  },
}));
Object.defineProperty(exports, "encodeAndAddWellKnownMetadata", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.encodeAndAddWellKnownMetadata;
  },
}));
Object.defineProperty(exports, "encodeCompositeMetadata", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.encodeCompositeMetadata;
  },
}));
Object.defineProperty(exports, "decodeCompositeMetadata", ({
  enumerable: true,
  get: function () {
    return _CompositeMetadata.decodeCompositeMetadata;
  },
}));
Object.defineProperty(exports, "RoutingMetadata", ({
  enumerable: true,
  get: function () {
    return _RoutingMetadata.RoutingMetadata;
  },
}));
Object.defineProperty(exports, "encodeRoute", ({
  enumerable: true,
  get: function () {
    return _RoutingMetadata.encodeRoute;
  },
}));
Object.defineProperty(exports, "encodeRoutes", ({
  enumerable: true,
  get: function () {
    return _RoutingMetadata.encodeRoutes;
  },
}));
Object.defineProperty(exports, "decodeRoutes", ({
  enumerable: true,
  get: function () {
    return _RoutingMetadata.decodeRoutes;
  },
}));
Object.defineProperty(exports, "encodeSimpleAuthMetadata", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.encodeSimpleAuthMetadata;
  },
}));
Object.defineProperty(exports, "encodeBearerAuthMetadata", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.encodeBearerAuthMetadata;
  },
}));
Object.defineProperty(exports, "encodeWellKnownAuthMetadata", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.encodeWellKnownAuthMetadata;
  },
}));
Object.defineProperty(exports, "encodeCustomAuthMetadata", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.encodeCustomAuthMetadata;
  },
}));
Object.defineProperty(exports, "decodeSimpleAuthPayload", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.decodeSimpleAuthPayload;
  },
}));
Object.defineProperty(exports, "decodeAuthMetadata", ({
  enumerable: true,
  get: function () {
    return _AuthMetadata.decodeAuthMetadata;
  },
}));

var _RSocketClient = _interopRequireDefault(__webpack_require__(/*! ./RSocketClient */ "../../node_modules/rsocket-core/build/RSocketClient.js"));

var _RSocketServer = _interopRequireDefault(__webpack_require__(/*! ./RSocketServer */ "../../node_modules/rsocket-core/build/RSocketServer.js"));

var _RSocketResumableTransport = _interopRequireDefault(
  __webpack_require__(/*! ./RSocketResumableTransport */ "../../node_modules/rsocket-core/build/RSocketResumableTransport.js")
);

var _WellKnownMimeType = _interopRequireWildcard(
  __webpack_require__(/*! ./WellKnownMimeType */ "../../node_modules/rsocket-core/build/WellKnownMimeType.js")
);

var _WellKnownAuthType = _interopRequireWildcard(
  __webpack_require__(/*! ./WellKnownAuthType */ "../../node_modules/rsocket-core/build/WellKnownAuthType.js")
);

var _RSocketFrame = __webpack_require__(/*! ./RSocketFrame */ "../../node_modules/rsocket-core/build/RSocketFrame.js");

var _RSocketBinaryFraming = __webpack_require__(/*! ./RSocketBinaryFraming */ "../../node_modules/rsocket-core/build/RSocketBinaryFraming.js");

var _RSocketBufferUtils = __webpack_require__(/*! ./RSocketBufferUtils */ "../../node_modules/rsocket-core/build/RSocketBufferUtils.js");

var _RSocketEncoding = __webpack_require__(/*! ./RSocketEncoding */ "../../node_modules/rsocket-core/build/RSocketEncoding.js");

var _RSocketSerialization = __webpack_require__(/*! ./RSocketSerialization */ "../../node_modules/rsocket-core/build/RSocketSerialization.js");

var _RSocketLease = __webpack_require__(/*! ./RSocketLease */ "../../node_modules/rsocket-core/build/RSocketLease.js");

var _CompositeMetadata = __webpack_require__(/*! ./CompositeMetadata */ "../../node_modules/rsocket-core/build/CompositeMetadata.js");

var _RoutingMetadata = __webpack_require__(/*! ./RoutingMetadata */ "../../node_modules/rsocket-core/build/RoutingMetadata.js");

var _AuthMetadata = __webpack_require__(/*! ./AuthMetadata */ "../../node_modules/rsocket-core/build/AuthMetadata.js");
function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/Flowable.js":
/*!*************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/Flowable.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _FlowableMapOperator = _interopRequireDefault(
  __webpack_require__(/*! ./FlowableMapOperator */ "../../node_modules/rsocket-flowable/build/FlowableMapOperator.js")
);
var _FlowableTakeOperator = _interopRequireDefault(
  __webpack_require__(/*! ./FlowableTakeOperator */ "../../node_modules/rsocket-flowable/build/FlowableTakeOperator.js")
);
var _Invariant = _interopRequireDefault(__webpack_require__(/*! ./Invariant */ "../../node_modules/rsocket-flowable/build/Invariant.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * Implements the ReactiveStream `Publisher` interface with Rx-style operators.
 */
class Flowable {
  static just(...values) {
    return new Flowable((subscriber) => {
      let cancelled = false;
      let i = 0;
      subscriber.onSubscribe({
        cancel: () => {
          cancelled = true;
        },
        request: (n) => {
          while (!cancelled && n > 0 && i < values.length) {
            subscriber.onNext(values[i++]);
            n--;
          }
          if (!cancelled && i == values.length) {
            subscriber.onComplete();
          }
        },
      });
    });
  }

  static error(error) {
    return new Flowable((subscriber) => {
      subscriber.onSubscribe({
        cancel: () => {},
        request: () => {
          subscriber.onError(error);
        },
      });
    });
  }

  static never() {
    return new Flowable((subscriber) => {
      subscriber.onSubscribe({
        cancel: () => {},
        request: () => {},
      });
    });
  }

  constructor(source, max = Number.MAX_SAFE_INTEGER) {
    this._max = max;
    this._source = source;
  }

  subscribe(subscriberOrCallback) {
    let partialSubscriber;
    if (typeof subscriberOrCallback === 'function') {
      partialSubscriber = this._wrapCallback(subscriberOrCallback);
    } else {
      partialSubscriber = subscriberOrCallback;
    }
    const subscriber = new FlowableSubscriber(partialSubscriber, this._max);
    this._source(subscriber);
  }

  lift(onSubscribeLift) {
    return new Flowable((subscriber) =>
      this._source(onSubscribeLift(subscriber))
    );
  }

  map(fn) {
    return this.lift(
      (subscriber) => new _FlowableMapOperator.default(subscriber, fn)
    );
  }

  take(toTake) {
    return this.lift(
      (subscriber) => new _FlowableTakeOperator.default(subscriber, toTake)
    );
  }

  _wrapCallback(callback) {
    const max = this._max;
    return {
      onNext: callback,
      onSubscribe(subscription) {
        subscription.request(max);
      },
    };
  }
}

/**
 * @private
 */ exports["default"] = Flowable;
class FlowableSubscriber {
  constructor(subscriber, max) {
    _defineProperty(
      this,
      '_cancel',

      () => {
        if (!this._active) {
          return;
        }
        this._active = false;
        if (this._subscription) {
          this._subscription.cancel();
        }
      }
    );
    _defineProperty(
      this,
      '_request',

      (n) => {
        (0, _Invariant.default)(
          Number.isInteger(n) && n >= 1 && n <= this._max,
          'Flowable: Expected request value to be an integer with a ' +
            'value greater than 0 and less than or equal to %s, got ' +
            '`%s`.',
          this._max,
          n
        );

        if (!this._active) {
          return;
        }
        if (n === this._max) {
          this._pending = this._max;
        } else {
          this._pending += n;
          if (this._pending >= this._max) {
            this._pending = this._max;
          }
        }
        if (this._subscription) {
          this._subscription.request(n);
        }
      }
    );
    this._active = false;
    this._max = max;
    this._pending = 0;
    this._started = false;
    this._subscriber = subscriber || {};
    this._subscription = null;
  }
  onComplete() {
    if (!this._active) {
      console.warn(
        'Flowable: Invalid call to onComplete(): %s.',
        this._started
          ? 'onComplete/onError was already called'
          : 'onSubscribe has not been called'
      );
      return;
    }
    this._active = false;
    this._started = true;
    try {
      if (this._subscriber.onComplete) {
        this._subscriber.onComplete();
      }
    } catch (error) {
      if (this._subscriber.onError) {
        this._subscriber.onError(error);
      }
    }
  }
  onError(error) {
    if (this._started && !this._active) {
      console.warn(
        'Flowable: Invalid call to onError(): %s.',
        this._active
          ? 'onComplete/onError was already called'
          : 'onSubscribe has not been called'
      );
      return;
    }
    this._active = false;
    this._started = true;
    this._subscriber.onError && this._subscriber.onError(error);
  }
  onNext(data) {
    if (!this._active) {
      console.warn(
        'Flowable: Invalid call to onNext(): %s.',
        this._active
          ? 'onComplete/onError was already called'
          : 'onSubscribe has not been called'
      );
      return;
    }
    if (this._pending === 0) {
      console.warn(
        'Flowable: Invalid call to onNext(), all request()ed values have been ' +
          'published.'
      );
      return;
    }
    if (this._pending !== this._max) {
      this._pending--;
    }
    try {
      this._subscriber.onNext && this._subscriber.onNext(data);
    } catch (error) {
      if (this._subscription) {
        this._subscription.cancel();
      }
      this.onError(error);
    }
  }
  onSubscribe(subscription) {
    if (this._started) {
      console.warn('Flowable: Invalid call to onSubscribe(): already called.');
      return;
    }
    this._active = true;
    this._started = true;
    this._subscription = subscription;
    try {
      this._subscriber.onSubscribe &&
        this._subscriber.onSubscribe({
          cancel: this._cancel,
          request: this._request,
        });
    } catch (error) {
      this.onError(error);
    }
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/FlowableMapOperator.js":
/*!************************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/FlowableMapOperator.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

/**
 * An operator that acts like Array.map, applying a given function to
 * all values provided by its `Subscription` and passing the result to its
 * `Subscriber`.
 */
class FlowableMapOperator {
  constructor(subscriber, fn) {
    this._fn = fn;
    this._subscriber = subscriber;
    this._subscription = null;
  }

  onComplete() {
    this._subscriber.onComplete();
  }

  onError(error) {
    this._subscriber.onError(error);
  }

  onNext(t) {
    try {
      this._subscriber.onNext(this._fn(t));
    } catch (e) {
      if (!this._subscription) {
        throw new Error('subscription is null');
      }
      this._subscription.cancel();
      this._subscriber.onError(e);
    }
  }

  onSubscribe(subscription) {
    this._subscription = subscription;
    this._subscriber.onSubscribe(subscription);
  }
}
exports["default"] = FlowableMapOperator;


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/FlowableProcessor.js":
/*!**********************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/FlowableProcessor.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

class FlowableProcessor {
  constructor(source, fn) {
    this._source = source;
    this._transformer = fn;
    this._done = false;
    this._mappers = []; //mappers for map function
  }

  onSubscribe(subscription) {
    this._subscription = subscription;
  }

  onNext(t) {
    if (!this._sink) {
      console.warn('premature onNext for processor, dropping value');
      return;
    }

    let val = t;
    if (this._transformer) {
      val = this._transformer(t);
    }
    const finalVal = this._mappers.reduce(
      (interimVal, mapper) => mapper(interimVal),
      val
    );

    this._sink.onNext(finalVal);
  }

  onError(error) {
    this._error = error;
    if (!this._sink) {
      console.warn('premature onError for processor, marking complete/errored');
    } else {
      this._sink.onError(error);
    }
  }

  onComplete() {
    this._done = true;
    if (!this._sink) {
      console.warn('premature onError for processor, marking complete');
    } else {
      this._sink.onComplete();
    }
  }

  subscribe(subscriber) {
    if (this._source.subscribe) {
      this._source.subscribe(this);
    }
    this._sink = subscriber;
    this._sink.onSubscribe(this);

    if (this._error) {
      this._sink.onError(this._error);
    } else if (this._done) {
      this._sink.onComplete();
    }
  }

  map(fn) {
    this._mappers.push(fn);
    return this;
  }

  request(n) {
    this._subscription && this._subscription.request(n);
  }

  cancel() {
    this._subscription && this._subscription.cancel();
  }
}
exports["default"] = FlowableProcessor;


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/FlowableTakeOperator.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/FlowableTakeOperator.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

/**
 * An operator that requests a fixed number of values from its source
 * `Subscription` and forwards them to its `Subscriber`, cancelling the
 * subscription when the requested number of items has been reached.
 */
class FlowableTakeOperator {
  constructor(subscriber, toTake) {
    this._subscriber = subscriber;
    this._subscription = null;
    this._toTake = toTake;
  }

  onComplete() {
    this._subscriber.onComplete();
  }

  onError(error) {
    this._subscriber.onError(error);
  }

  onNext(t) {
    try {
      this._subscriber.onNext(t);
      if (--this._toTake === 0) {
        this._cancelAndComplete();
      }
    } catch (e) {
      if (!this._subscription) {
        throw new Error('subscription is null');
      }
      this._subscription.cancel();
      this._subscriber.onError(e);
    }
  }

  onSubscribe(subscription) {
    this._subscription = subscription;
    this._subscriber.onSubscribe(subscription);
    if (this._toTake <= 0) {
      this._cancelAndComplete();
    }
  }

  _cancelAndComplete() {
    if (!this._subscription) {
      throw new Error('subscription is null');
    }
    this._subscription.cancel();
    this._subscriber.onComplete();
  }
}
exports["default"] = FlowableTakeOperator;


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/FlowableTimer.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/FlowableTimer.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports.every = every;

var _Flowable = _interopRequireDefault(__webpack_require__(/*! ./Flowable */ "../../node_modules/rsocket-flowable/build/Flowable.js"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Returns a Publisher that provides the current time (Date.now()) every `ms`
 * milliseconds.
 *
 * The timer is established on the first call to `request`: on each
 * interval a value is published if there are outstanding requests,
 * otherwise nothing occurs for that interval. This approach ensures
 * that the interval between `onNext` calls is as regular as possible
 * and means that overlapping `request` calls (ie calling again before
 * the previous values have been vended) behaves consistently.
 */
function every(ms) {
  return new _Flowable.default((subscriber) => {
    let intervalId = null;
    let pending = 0;
    subscriber.onSubscribe({
      cancel: () => {
        if (intervalId != null) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },
      request: (n) => {
        if (n < Number.MAX_SAFE_INTEGER) {
          pending += n;
        } else {
          pending = Number.MAX_SAFE_INTEGER;
        }
        if (intervalId != null) {
          return;
        }
        intervalId = setInterval(() => {
          if (pending > 0) {
            if (pending !== Number.MAX_SAFE_INTEGER) {
              pending--;
            }
            subscriber.onNext(Date.now());
          }
        }, ms);
      },
    });
  });
}


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/Invariant.js":
/*!**************************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/Invariant.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */


/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments to provide
 * information about what broke and what you were expecting.
 *
 * The invariant message will be stripped in production, but the invariant will
 * remain to ensure logic does not differ in production.
 */
function invariant(condition, format, ...args) {
  if (!condition) {
    let error;

    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified ' +
          'dev environment for the full error message and additional helpful warnings.'
      );
    } else {
      let argIndex = 0;
      error = new Error(format.replace(/%s/g, () => String(args[argIndex++])));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // Skip invariant's own stack frame.

    throw error;
  }
}

module.exports = invariant;


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/Single.js":
/*!***********************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/Single.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

/**
 * Represents a lazy computation that will either produce a value of type T
 * or fail with an error. Calling `subscribe()` starts the
 * computation and returns a subscription object, which has an `unsubscribe()`
 * method that can be called to prevent completion/error callbacks from being
 * invoked and, where supported, to also cancel the computation.
 * Implementations may optionally implement cancellation; if they do not
 * `cancel()` is a no-op.
 *
 * Note: Unlike Promise, callbacks (onComplete/onError) may be invoked
 * synchronously.
 *
 * Example:
 *
 * ```
 * const value = new Single(subscriber => {
 *   const id = setTimeout(
 *     () => subscriber.onComplete('Hello!'),
 *     250
 *   );
 *   // Optional: Call `onSubscribe` with a cancellation callback
 *   subscriber.onSubscribe(() => clearTimeout(id));
 * });
 *
 * // Start the computation. onComplete will be called after the timeout
 * // with 'hello'  unless `cancel()` is called first.
 * value.subscribe({
 *   onComplete: value => console.log(value),
 *   onError: error => console.error(error),
 *   onSubscribe: cancel => ...
 * });
 * ```
 */
class Single {
  static of(value) {
    return new Single((subscriber) => {
      subscriber.onSubscribe();
      subscriber.onComplete(value);
    });
  }

  static error(error) {
    return new Single((subscriber) => {
      subscriber.onSubscribe();
      subscriber.onError(error);
    });
  }

  static never() {
    return new Single((subscriber) => {
      subscriber.onSubscribe();
    });
  }

  constructor(source) {
    this._source = source;
  }

  subscribe(partialSubscriber) {
    const subscriber = new FutureSubscriber(partialSubscriber);
    try {
      this._source(subscriber);
    } catch (error) {
      subscriber.onError(error);
    }
  }

  flatMap(fn) {
    return new Single((subscriber) => {
      let currentCancel;
      const cancel = () => {
        currentCancel && currentCancel();
        currentCancel = null;
      };
      this._source({
        onComplete: (value) => {
          fn(value).subscribe({
            onComplete: (mapValue) => {
              subscriber.onComplete(mapValue);
            },
            onError: (error) => subscriber.onError(error),
            onSubscribe: (_cancel) => {
              currentCancel = _cancel;
            },
          });
        },
        onError: (error) => subscriber.onError(error),
        onSubscribe: (_cancel) => {
          currentCancel = _cancel;
          subscriber.onSubscribe(cancel);
        },
      });
    });
  }

  /**
   * Return a new Single that resolves to the value of this Single applied to
   * the given mapping function.
   */
  map(fn) {
    return new Single((subscriber) => {
      return this._source({
        onComplete: (value) => subscriber.onComplete(fn(value)),
        onError: (error) => subscriber.onError(error),
        onSubscribe: (cancel) => subscriber.onSubscribe(cancel),
      });
    });
  }

  then(successFn, errorFn) {
    this.subscribe({
      onComplete: successFn || (() => {}),
      onError: errorFn || (() => {}),
    });
  }
}

/**
 * @private
 */ exports["default"] = Single;
class FutureSubscriber {
  constructor(subscriber) {
    this._active = false;
    this._started = false;
    this._subscriber = subscriber || {};
  }

  onComplete(value) {
    if (!this._active) {
      console.warn(
        'Single: Invalid call to onComplete(): %s.',
        this._started
          ? 'onComplete/onError was already called'
          : 'onSubscribe has not been called'
      );

      return;
    }
    this._active = false;
    this._started = true;
    try {
      if (this._subscriber.onComplete) {
        this._subscriber.onComplete(value);
      }
    } catch (error) {
      if (this._subscriber.onError) {
        this._subscriber.onError(error);
      }
    }
  }

  onError(error) {
    if (this._started && !this._active) {
      console.warn(
        'Single: Invalid call to onError(): %s.',
        this._active
          ? 'onComplete/onError was already called'
          : 'onSubscribe has not been called'
      );

      return;
    }
    this._active = false;
    this._started = true;
    this._subscriber.onError && this._subscriber.onError(error);
  }

  onSubscribe(cancel) {
    if (this._started) {
      console.warn('Single: Invalid call to onSubscribe(): already called.');
      return;
    }
    this._active = true;
    this._started = true;
    try {
      this._subscriber.onSubscribe &&
        this._subscriber.onSubscribe(() => {
          if (!this._active) {
            return;
          }
          this._active = false;
          cancel && cancel();
        });
    } catch (error) {
      this.onError(error);
    }
  }
}


/***/ }),

/***/ "../../node_modules/rsocket-flowable/build/index.js":
/*!**********************************************************!*\
  !*** ../../node_modules/rsocket-flowable/build/index.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
Object.defineProperty(exports, "Flowable", ({
  enumerable: true,
  get: function () {
    return _Flowable.default;
  },
}));
Object.defineProperty(exports, "Single", ({
  enumerable: true,
  get: function () {
    return _Single.default;
  },
}));
Object.defineProperty(exports, "FlowableProcessor", ({
  enumerable: true,
  get: function () {
    return _FlowableProcessor.default;
  },
}));
Object.defineProperty(exports, "every", ({
  enumerable: true,
  get: function () {
    return _FlowableTimer.every;
  },
}));

var _Flowable = _interopRequireDefault(__webpack_require__(/*! ./Flowable */ "../../node_modules/rsocket-flowable/build/Flowable.js"));
var _Single = _interopRequireDefault(__webpack_require__(/*! ./Single */ "../../node_modules/rsocket-flowable/build/Single.js"));
var _FlowableProcessor = _interopRequireDefault(__webpack_require__(/*! ./FlowableProcessor */ "../../node_modules/rsocket-flowable/build/FlowableProcessor.js"));
var _FlowableTimer = __webpack_require__(/*! ./FlowableTimer */ "../../node_modules/rsocket-flowable/build/FlowableTimer.js");
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}


/***/ }),

/***/ "../../node_modules/rsocket-types/build/ReactiveSocketTypes.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rsocket-types/build/ReactiveSocketTypes.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({value: true}));
exports.CONNECTION_STATUS = void 0;
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */

/**
 * A contract providing different interaction models per the [ReactiveSocket protocol]
 (https://github.com/ReactiveSocket/reactivesocket/blob/master/Protocol.md).
 */

/**
 * Represents a network connection with input/output used by a ReactiveSocket to
 * send/receive data.
 */

/**
 * Describes the connection status of a ReactiveSocket/DuplexConnection.
 * - NOT_CONNECTED: no connection established or pending.
 * - CONNECTING: when `connect()` has been called but a connection is not yet
 *   established.
 * - CONNECTED: when a connection is established.
 * - CLOSED: when the connection has been explicitly closed via `close()`.
 * - ERROR: when the connection has been closed for any other reason.
 */

const CONNECTION_STATUS = {
  CLOSED: Object.freeze({kind: 'CLOSED'}),
  CONNECTED: Object.freeze({kind: 'CONNECTED'}),
  CONNECTING: Object.freeze({kind: 'CONNECTING'}),
  NOT_CONNECTED: Object.freeze({kind: 'NOT_CONNECTED'}),
};

/**
 * A type that can be written to a buffer.
 */ exports.CONNECTION_STATUS = CONNECTION_STATUS;


/***/ }),

/***/ "../../node_modules/rsocket-types/build/ReactiveStreamTypes.js":
/*!*********************************************************************!*\
  !*** ../../node_modules/rsocket-types/build/ReactiveStreamTypes.js ***!
  \*********************************************************************/
/***/ (() => {

"use strict";



/***/ }),

/***/ "../../node_modules/rsocket-types/build/index.js":
/*!*******************************************************!*\
  !*** ../../node_modules/rsocket-types/build/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));

var _ReactiveSocketTypes = __webpack_require__(/*! ./ReactiveSocketTypes */ "../../node_modules/rsocket-types/build/ReactiveSocketTypes.js");
Object.keys(_ReactiveSocketTypes).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  if (key in exports && exports[key] === _ReactiveSocketTypes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ReactiveSocketTypes[key];
    },
  });
});

var _ReactiveStreamTypes = __webpack_require__(/*! ./ReactiveStreamTypes */ "../../node_modules/rsocket-types/build/ReactiveStreamTypes.js");
Object.keys(_ReactiveStreamTypes).forEach(function (key) {
  if (key === 'default' || key === '__esModule') return;
  if (key in exports && exports[key] === _ReactiveStreamTypes[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ReactiveStreamTypes[key];
    },
  });
});


/***/ }),

/***/ "../../node_modules/rsocket-websocket-client/build/RSocketWebSocketClient.js":
/*!***********************************************************************************!*\
  !*** ../../node_modules/rsocket-websocket-client/build/RSocketWebSocketClient.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _rsocketFlowable = __webpack_require__(/*! rsocket-flowable */ "../../node_modules/rsocket-flowable/build/index.js");
var _rsocketCore = __webpack_require__(/*! rsocket-core */ "../../node_modules/rsocket-core/build/index.js");

var _rsocketTypes = __webpack_require__(/*! rsocket-types */ "../../node_modules/rsocket-types/build/index.js");
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

/**
 * A WebSocket transport client for use in browser environments.
 */
class RSocketWebSocketClient {
  constructor(options, encoders) {
    _defineProperty(
      this,
      '_handleClosed',

      (e) => {
        this._close(
          new Error(
            e.reason || 'RSocketWebSocketClient: Socket closed unexpectedly.'
          )
        );
      }
    );
    _defineProperty(
      this,
      '_handleError',

      (e) => {
        this._close(e.error);
      }
    );
    _defineProperty(
      this,
      '_handleOpened',

      () => {
        this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTED);
      }
    );
    _defineProperty(
      this,
      '_handleMessage',

      (message) => {
        try {
          const frame = this._readFrame(message);
          this._receivers.forEach((subscriber) => subscriber.onNext(frame));
        } catch (error) {
          this._close(error);
        }
      }
    );
    this._encoders = encoders;
    this._options = options;
    this._receivers = new Set();
    this._senders = new Set();
    this._socket = null;
    this._status = _rsocketTypes.CONNECTION_STATUS.NOT_CONNECTED;
    this._statusSubscribers = new Set();
  }
  close() {
    this._close();
  }
  connect() {
    if (this._status.kind !== 'NOT_CONNECTED') {
      throw new Error(
        'RSocketWebSocketClient: Cannot connect(), a connection is already ' +
          'established.'
      );
    }
    this._setConnectionStatus(_rsocketTypes.CONNECTION_STATUS.CONNECTING);
    const wsCreator = this._options.wsCreator;
    const url = this._options.url;
    this._socket = wsCreator ? wsCreator(url) : new WebSocket(url);
    const socket = this._socket;
    socket.binaryType = 'arraybuffer';
    socket.addEventListener('close', this._handleClosed);
    socket.addEventListener('error', this._handleError);
    socket.addEventListener('open', this._handleOpened);
    socket.addEventListener('message', this._handleMessage);
  }
  connectionStatus() {
    return new _rsocketFlowable.Flowable((subscriber) => {
      subscriber.onSubscribe({
        cancel: () => {
          this._statusSubscribers.delete(subscriber);
        },
        request: () => {
          this._statusSubscribers.add(subscriber);
          subscriber.onNext(this._status);
        },
      });
    });
  }
  receive() {
    return new _rsocketFlowable.Flowable((subject) => {
      subject.onSubscribe({
        cancel: () => {
          this._receivers.delete(subject);
        },
        request: () => {
          this._receivers.add(subject);
        },
      });
    });
  }
  sendOne(frame) {
    this._writeFrame(frame);
  }
  send(frames) {
    let subscription;
    frames.subscribe({
      onComplete: () => {
        subscription && this._senders.delete(subscription);
      },
      onError: (error) => {
        subscription && this._senders.delete(subscription);
        this._close(error);
      },
      onNext: (frame) => this._writeFrame(frame),
      onSubscribe: (_subscription) => {
        subscription = _subscription;
        this._senders.add(subscription);
        subscription.request(Number.MAX_SAFE_INTEGER);
      },
    });
  }
  _close(error) {
    if (this._status.kind === 'CLOSED' || this._status.kind === 'ERROR') {
      // already closed
      return;
    }
    const status = error
      ? {error, kind: 'ERROR'}
      : _rsocketTypes.CONNECTION_STATUS.CLOSED;
    this._setConnectionStatus(status);
    this._receivers.forEach((subscriber) => {
      if (error) {
        subscriber.onError(error);
      } else {
        subscriber.onComplete();
      }
    });
    this._receivers.clear();
    this._senders.forEach((subscription) => subscription.cancel());
    this._senders.clear();
    const socket = this._socket;
    if (socket) {
      socket.removeEventListener('close', this._handleClosed);
      socket.removeEventListener('error', this._handleError);
      socket.removeEventListener('open', this._handleOpened);
      socket.removeEventListener('message', this._handleMessage);
      socket.close();
      this._socket = null;
    }
  }
  _setConnectionStatus(status) {
    this._status = status;
    this._statusSubscribers.forEach((subscriber) => subscriber.onNext(status));
  }
  _readFrame(message) {
    const buffer = (0, _rsocketCore.toBuffer)(message.data);
    const frame = this._options.lengthPrefixedFrames
      ? (0, _rsocketCore.deserializeFrameWithLength)(buffer, this._encoders)
      : (0, _rsocketCore.deserializeFrame)(buffer, this._encoders);
    if (false) {}
    return frame;
  }

  _writeFrame(frame) {
    try {
      if (false) {}
      const buffer = this._options.lengthPrefixedFrames
        ? (0, _rsocketCore.serializeFrameWithLength)(frame, this._encoders)
        : (0, _rsocketCore.serializeFrame)(frame, this._encoders);
      if (!this._socket) {
        throw new Error(
          'RSocketWebSocketClient: Cannot send frame, not connected.'
        );
      }
      this._socket.send(buffer);
    } catch (error) {
      this._close(error);
    }
  }
}
exports["default"] = RSocketWebSocketClient;


/***/ }),

/***/ "../../node_modules/rsocket-websocket-client/build/index.js":
/*!******************************************************************!*\
  !*** ../../node_modules/rsocket-websocket-client/build/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/** Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 */


Object.defineProperty(exports, "__esModule", ({value: true}));
exports["default"] = void 0;

var _RSocketWebSocketClient = _interopRequireDefault(
  __webpack_require__(/*! ./RSocketWebSocketClient */ "../../node_modules/rsocket-websocket-client/build/RSocketWebSocketClient.js")
);
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
var _default = _RSocketWebSocketClient.default;
exports["default"] = _default;


/***/ }),

/***/ "./src/data.ts":
/*!*********************!*\
  !*** ./src/data.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserDetails = void 0;
class UserDetails {
    constructor(id, name, password) {
        this.id = id;
        this.name = name;
        this.password = password;
    }
    toString() {
        return `User id: ${this.id} name: ${this.name} password: ${this.password}`;
    }
}
exports.UserDetails = UserDetails;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! @trivial-pursuit-client/api */ "../api/dist/index.js");
__exportStar(__webpack_require__(/*! ./websocket-server */ "./src/websocket-server.ts"), exports);
// console.log("Salut de la part de Websocket !");
const rsocket_client_1 = __webpack_require__(/*! ./rsocket-client */ "./src/rsocket-client.ts");
console.log("Start");
const url = 'ws://localhost:6565/rsocket';
(0, rsocket_client_1.init)(url);


/***/ }),

/***/ "./src/mediator.ts":
/*!*************************!*\
  !*** ./src/mediator.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mediator = void 0;
const data_1 = __webpack_require__(/*! ./data */ "./src/data.ts");
/**
 * This class interacts with an HTML page containing an input field of id 'user-id' and
 * a list of elements of id 'result'
 */
class Mediator {
    constructor(server) {
        this._server = server;
    }
    get server() {
        return this._server;
    }
    init() {
        console.log("Mediator::init()");
        this.inputElement = document.getElementById(Mediator.fieldId);
        this.inputElement.addEventListener('change', (evt) => {
            this.changed(evt);
        });
        this.outputList = document.getElementById(Mediator.listId);
    }
    addResult(value) {
        let item = document.createElement('li');
        item.innerHTML = value;
        this.outputList.appendChild(item);
    }
    /**
     *  Method called when the input field ('user-id') is modified
     */
    changed(event) {
        console.log("fieldChanged() called");
        let element = event.target;
        let id = parseInt(element.value);
        this._server.findUserById(id)
            .subscribe({
            onComplete: (payload) => {
                console.log("COMPLETED");
                const data = payload.data;
                console.log(data.valueOf());
                let user = new data_1.UserDetails(data.id, data.name, data.password);
                this.addResult(user.toString());
            },
            onError: (err) => {
                console.log("ERROR => " + err);
                console.log("ERROR STACK: " + err.stack);
            },
            onSubscribe: (subscription) => {
            },
        });
    }
}
exports.Mediator = Mediator;
Mediator.fieldId = 'user-id';
Mediator.listId = 'result';


/***/ }),

/***/ "./src/rsocket-client.ts":
/*!*******************************!*\
  !*** ./src/rsocket-client.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.init = void 0;
const rsocket_connection_1 = __webpack_require__(/*! ./rsocket-connection */ "./src/rsocket-connection.ts");
const mediator_1 = __webpack_require__(/*! ./mediator */ "./src/mediator.ts");
const server_proxy_1 = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.ts");
/**
 * Connects the RSocketClient to server.
 *
 * @param url
 */
function init(url) {
    let client = (0, rsocket_connection_1.createClient)(url);
    client.connect().subscribe({
        onComplete: socket => {
            console.log("onComplete");
            let mediator = new mediator_1.Mediator(new server_proxy_1.ServerProxy(socket));
            mediator.init();
        },
        onError: error => {
            console.log("onError");
            console.error(error);
        },
        onSubscribe: (cancel) => {
            console.log("onSubscribe");
        }
    });
}
exports.init = init;


/***/ }),

/***/ "./src/rsocket-connection.ts":
/*!***********************************!*\
  !*** ./src/rsocket-connection.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createClient = void 0;
const rsocket_core_1 = __webpack_require__(/*! rsocket-core */ "../../node_modules/rsocket-core/build/index.js");
const rsocket_websocket_client_1 = __importDefault(__webpack_require__(/*! rsocket-websocket-client */ "../../node_modules/rsocket-websocket-client/build/index.js"));
/**
 * Configures and creates an instance of RSocketClient
 *
 * @param url the Endpoint
 * @returns a new instance of RSocketClient
 */
function createClient(url) {
    const options = {
        url: url,
        wsCreator: (url) => { return new WebSocket(url); }
    };
    const wsClient = new rsocket_websocket_client_1.default(options);
    const config = {
        serializers: {
            data: rsocket_core_1.JsonSerializer,
            metadata: rsocket_core_1.IdentitySerializer
        },
        setup: {
            keepAlive: 60000,
            lifetime: 180000,
            dataMimeType: 'application/json',
            metadataMimeType: 'message/x.rsocket.routing.v0',
            payload: {
                data: 'one',
                metadata: String.fromCharCode('connect'.length) + 'connect'
            },
        },
        transport: wsClient
    };
    return new rsocket_core_1.RSocketClient(config);
}
exports.createClient = createClient;


/***/ }),

/***/ "./src/server-proxy.ts":
/*!*****************************!*\
  !*** ./src/server-proxy.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ServerProxy = void 0;
/**
 * This class receives local request and transfers them to the RSocketServer,
 * through the socket
 */
class ServerProxy {
    constructor(socket) {
        this.socket = socket;
    }
    findUserById(id) {
        console.log("finUserId() called");
        return this.socket.requestResponse({
            data: id,
            metadata: String.fromCharCode('user'.length) + 'user'
        });
    }
}
exports.ServerProxy = ServerProxy;


/***/ }),

/***/ "./src/websocket-server.ts":
/*!*********************************!*\
  !*** ./src/websocket-server.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebsocketServer = void 0;
class WebsocketServer {
    connect(user, password) {
        console.log("Appel de WebsocketServer::connect(" + user + ", " + password + ")");
        return true;
    }
    disconnect() {
        console.log("Appel de disconnect()");
    }
}
exports.WebsocketServer = WebsocketServer;


/***/ }),

/***/ "../api/dist/index.js":
/*!****************************!*\
  !*** ../api/dist/index.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./server */ "../api/dist/server.js"), exports);
//console.log("Salut de la part d'API !");
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../api/dist/server.js":
/*!*****************************!*\
  !*** ../api/dist/server.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=server.js.map

/***/ }),

/***/ "?22d6":
/*!************************!*\
  !*** buffer (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiLDhDQUE2QyxDQUFDLFlBQVksRUFBQztBQUMzRCxtQ0FBbUM7QUFDbkMsZ0NBQWdDO0FBQ2hDLGdDQUFnQztBQUNoQyxnQ0FBZ0M7QUFDaEMsMEJBQTBCO0FBQzFCLCtCQUErQjs7QUFFL0Isa0JBQWtCLG1CQUFPLENBQUMseUVBQWM7QUFDeEMsMEJBQTBCLG1CQUFPLENBQUMseUZBQXNCO0FBQ3hEO0FBQ0EsRUFBRSxtQkFBTyxDQUFDLHVGQUFxQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsc0NBQXNDO0FBQ3RDLHVDQUF1Qzs7QUFFdkM7QUFDQSx3Q0FBd0MseUJBQXlCLGtCQUFrQjtBQUNuRjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIseUJBQXlCLGFBQWE7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsb0JBQW9CO0FBQ3ZEO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EseURBQXlELGNBQWMsa0JBQWtCO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQix5QkFBeUIsYUFBYTtBQUMzRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixjQUFjLGlEQUFpRDtBQUNwRjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0R0FBNEcsZUFBZTtBQUMzSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsY0FBYyxpQ0FBaUM7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHlCQUF5QixjQUFjLE1BQU0sb0JBQW9CO0FBQ2pFO0FBQ0Esa0NBQWtDO0FBQ2xDLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLFVBQVU7QUFDVjs7Ozs7Ozs7Ozs7O0FDcFFhO0FBQ2IsOENBQTZDLENBQUMsWUFBWSxFQUFDO0FBQzNELCtCQUErQjtBQUMvQixrQ0FBa0M7QUFDbEMscUNBQXFDO0FBQ3JDLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFDcEMsa0NBQWtDO0FBQ2xDLHFDQUFxQztBQUNyQywrQkFBK0I7QUFDL0IsOEJBQThCLEdBQUcsNkJBQTZCLEdBQUcsNkJBQTZCLEdBQUcseUJBQXlCOztBQUUxSCxrQkFBa0IsbUJBQU8sQ0FBQyx5RUFBYztBQUN4QywwQkFBMEIsbUJBQU8sQ0FBQyx5RkFBc0I7O0FBRXhEO0FBQ0EsRUFBRSxtQkFBTyxDQUFDLHVGQUFxQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXlDLHlCQUF5QixJQUFJO0FBQ3RFLG1CQUFtQixjQUFjLHlCQUF5QjtBQUMxRDtBQUNBO0FBQ0EsYUFBYTtBQUNiLElBQUkseUJBQXlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG9FQUFvRTtBQUNwRSxVQUFVLDJCQUEyQixjQUFjO0FBQ25ELDRDQUE0QztBQUM1QyxrREFBa0Q7QUFDbEQsaUNBQWlDO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix3QkFBd0I7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0VBQW9FO0FBQ3BFLFVBQVU7QUFDVjtBQUNBO0FBQ0EseUJBQXlCLHdCQUF3QjtBQUNqRCw2QkFBNkIseUJBQXlCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esb0VBQW9FLGNBQWMsWUFBWTtBQUM5RixZQUFZO0FBQ1o7QUFDQSxhQUFhLDRCQUE0QiwrQ0FBK0M7QUFDeEYsVUFBVSxxREFBcUQ7QUFDL0QscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBLHVDQUF1Qyw2Q0FBNkM7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsZUFBZTtBQUN2RDtBQUNBLDBCQUEwQiw2QkFBNkI7QUFDdkQ7QUFDQSwrREFBK0QsOEJBQThCO0FBQzdGLFFBQVEsdUNBQXVDO0FBQy9DLGNBQWMsZUFBZTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsb0JBQW9CLDBCQUEwQixjQUFjO0FBQ3pFO0FBQ0E7QUFDQSx5RkFBeUY7QUFDekYsdURBQXVEO0FBQ3ZELDJDQUEyQyxtQkFBbUI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FLFdBQVc7QUFDL0U7QUFDQSwrQ0FBK0MsZUFBZTtBQUM5RDtBQUNBLCtDQUErQyxtQkFBbUI7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhLDhDQUE4QztBQUMzRCxvQkFBb0IsY0FBYztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix3QkFBd0I7QUFDakQsMkNBQTJDLHlCQUF5QjtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCLGNBQWMsTUFBTTtBQUNyQztBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7O0FBRTdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTSxhQUFhO0FBQ25CLGFBQWEsV0FBVztBQUN4QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdDQUF3Qyx5QkFBeUI7QUFDakU7QUFDQTtBQUNBLHdDQUF3Qyx5QkFBeUI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qjs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0JBQWtCLHlCQUF5QjtBQUMzQztBQUNBLGtCQUFrQix5QkFBeUI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsWUFBWSwyQkFBMkIsY0FBYztBQUNsRTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsbUNBQW1DLE9BQU87QUFDdkUsNkRBQTZEO0FBQzdEO0FBQ0EsZ0VBQWdFO0FBQ2hFLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksOEJBQThCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSx5Q0FBeUM7QUFDekMsMENBQTBDOztBQUUxQztBQUNBO0FBQ0EsK0NBQStDLFlBQVk7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7QUM1ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCOztBQUUzQjtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztBQ3hDYTtBQUNiLDhDQUE2QyxDQUFDLFlBQVksRUFBQztBQUMzRCxrQkFBa0IsR0FBRyxjQUFjOztBQUVuQyxxQ0FBcUMsbUJBQU8sQ0FBQyxxQkFBUTtBQUNyRDtBQUNBLHdDQUF3QztBQUN4Qzs7QUFFQTtBQUNBLFNBQVMscUJBQU0sb0JBQW9CLHFCQUFNO0FBQ3pDOztBQUVBO0FBQ0EsNENBQTRDLElBQUk7QUFDaEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxJQUFJO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsSUFBSTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsSUFBSTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxJQUFJO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLElBQUk7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxJQUFJO0FBQ2Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsU0FBUztBQUN0RDs7QUFFQTs7QUFFQTtBQUNBLDZDQUE2QyxTQUFTO0FBQ3REOztBQUVBO0FBQ0EsdUJBQXVCLFNBQVM7QUFDaEM7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBEO0FBQzFEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixZQUFZO0FBQzlCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTLFlBQVk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRUFBcUUsWUFBWTtBQUNqRjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsdURBQXVELHVCQUF1QjtBQUM5RTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLHFDQUFxQzs7QUFFckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUdBQWlHLG1CQUFtQjtBQUNwSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxvQkFBb0IsaUJBQWlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0NBQWtDO0FBQ2xDLHFDQUFxQzs7QUFFckM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjOztBQUVkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBLHFDQUFxQyxxQkFBTTtBQUMzQyxrQkFBa0I7Ozs7Ozs7Ozs7OztBQzMrQmxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVhOztBQUViLG1EQUFtRCw4Q0FHakQsQ0FBQyxZQUFZLEVBQ2Q7QUFDRCxrQ0FBa0M7QUFDbEMseUJBQXlCO0FBQ3pCLGdDQUFnQztBQUNoQyx3QkFBd0I7QUFDeEIsc0JBQXNCO0FBQ3RCLG1CQUFtQjs7QUFFbkIsd0NBQXdDLG1CQUFPLENBQUMsdUVBQWE7QUFDN0Qsb0JBQW9CLG1CQUFPLENBQUMsNkVBQWdCOztBQUU1Qyx1QkFBdUIsbUJBQU8sQ0FBQyxtRkFBbUI7QUFDbEQsMEJBQTBCLG1CQUFPLENBQUMseUZBQXNCO0FBQ3hEO0FBQ0Esd0NBQXdDO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFLHlEQUF5RDtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFD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Q0FBQyw2RUFBZ0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixzQkFBc0I7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlLFVBQVU7QUFDekI7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1QztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsa0JBQWtCO0FBQ2hFO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsaUJBQWlCO0FBQ2pCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNULFFBQVE7QUFDUjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUIsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLLEVBQUUsRUFNVjtBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxLQUFLLEVBQUUsRUFNVjtBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjs7QUFFQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCLDRCQUE0QjtBQUM1QixpQ0FBaUM7QUFDakMsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUwsOERBQThELGFBQWE7QUFDM0U7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQzM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRWE7QUFDYiw4Q0FBNkMsQ0FBQyxZQUFZLEVBQUM7QUFDM0Qsa0JBQWU7O0FBRWYsdUJBQXVCLG1CQUFPLENBQUMsNEVBQWtCO0FBQ2pELHdDQUF3QyxtQkFBTyxDQUFDLHVFQUFhO0FBQzdELG9CQUFvQixtQkFBTyxDQUFDLDZFQUFnQjs7QUFFNUMsb0JBQW9CLG1CQUFPLENBQUMsc0VBQWU7O0FBRTNDLDRCQUE0QixtQkFBTyxDQUFDLDZGQUF3QjtBQUM1RDtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isc0JBQXNCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPOztBQUVQO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUNBQWlDLHFCQUFxQjtBQUN0RCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixnQkFBZ0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtB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LElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsVUFBVTtRQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0o7QUFSRCwwQ0FRQzs7Ozs7Ozs7Ozs7O0FDVlk7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsb0NBQW9DO0FBQ25EO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsYUFBYSxtQkFBTyxDQUFDLHVDQUFVO0FBQy9CO0FBQ0E7Ozs7Ozs7Ozs7O0FDbEJhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdEOzs7Ozs7Ozs7O0FDRkE7Ozs7OztVQ0FBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztVRVBEO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvQXV0aE1ldGFkYXRhLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL0NvbXBvc2l0ZU1ldGFkYXRhLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL0ludmFyaWFudC5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9MaXRlQnVmZmVyLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL1JTb2NrZXRCaW5hcnlGcmFtaW5nLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL1JTb2NrZXRCdWZmZXJVdGlscy5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9SU29ja2V0Q2xpZW50LmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL1JTb2NrZXRFbmNvZGluZy5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9SU29ja2V0RnJhbWUuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvUlNvY2tldExlYXNlLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL1JTb2NrZXRNYWNoaW5lLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1jb3JlL2J1aWxkL1JTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvUlNvY2tldFNlcmlhbGl6YXRpb24uanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvUlNvY2tldFNlcnZlci5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9SU29ja2V0VmVyc2lvbi5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9SZWFzc2VtYmx5RHVwbGV4Q29ubmVjdGlvbi5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtY29yZS9idWlsZC9Sb3V0aW5nTWV0YWRhdGEuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvV2VsbEtub3duQXV0aFR5cGUuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvV2VsbEtub3duTWltZVR5cGUuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWNvcmUvYnVpbGQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWZsb3dhYmxlL2J1aWxkL0Zsb3dhYmxlLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1mbG93YWJsZS9idWlsZC9GbG93YWJsZU1hcE9wZXJhdG9yLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1mbG93YWJsZS9idWlsZC9GbG93YWJsZVByb2Nlc3Nvci5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtZmxvd2FibGUvYnVpbGQvRmxvd2FibGVUYWtlT3BlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWZsb3dhYmxlL2J1aWxkL0Zsb3dhYmxlVGltZXIuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LWZsb3dhYmxlL2J1aWxkL0ludmFyaWFudC5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtZmxvd2FibGUvYnVpbGQvU2luZ2xlLmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi8uLi9ub2RlX21vZHVsZXMvcnNvY2tldC1mbG93YWJsZS9idWlsZC9pbmRleC5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtdHlwZXMvYnVpbGQvUmVhY3RpdmVTb2NrZXRUeXBlcy5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtdHlwZXMvYnVpbGQvUmVhY3RpdmVTdHJlYW1UeXBlcy5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtdHlwZXMvYnVpbGQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uLy4uL25vZGVfbW9kdWxlcy9yc29ja2V0LXdlYnNvY2tldC1jbGllbnQvYnVpbGQvUlNvY2tldFdlYlNvY2tldENsaWVudC5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi4vLi4vbm9kZV9tb2R1bGVzL3Jzb2NrZXQtd2Vic29ja2V0LWNsaWVudC9idWlsZC9pbmRleC5qcyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi9zcmMvZGF0YS50cyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4vc3JjL21lZGlhdG9yLnRzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uL3NyYy9yc29ja2V0LWNsaWVudC50cyIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvLi9zcmMvcnNvY2tldC1jb25uZWN0aW9uLnRzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uL3NyYy9zZXJ2ZXItcHJveHkudHMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4vc3JjL3dlYnNvY2tldC1zZXJ2ZXIudHMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0Ly4uL2FwaS9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL0B0cml2aWFsLXB1cnN1aXQtY2xpZW50L3dlYnNvY2tldC8uLi9hcGkvZGlzdC9zZXJ2ZXIuanMiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0L2lnbm9yZWR8QzpcXFVzZXJzXFxIdWdvXFxEb2N1bWVudHNcXFVuaXZcXE0xX0FMTUFfc2VtZXN0cmVfMVxcUHJvamV0X1RyYW5zdmVyc2FsXFx0cml2aWFsX3B1cnN1aXRfZnVsbF9zdGFja1xcdHJpdmlhbF9wdXJzdWl0X2NsaWVudFxcbm9kZV9tb2R1bGVzXFxyc29ja2V0LWNvcmVcXGJ1aWxkfGJ1ZmZlciIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0L3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vQHRyaXZpYWwtcHVyc3VpdC1jbGllbnQvd2Vic29ja2V0L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9AdHJpdmlhbC1wdXJzdWl0LWNsaWVudC93ZWJzb2NrZXQvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5lbmNvZGVXZWxsS25vd25BdXRoTWV0YWRhdGEgPSBlbmNvZGVXZWxsS25vd25BdXRoTWV0YWRhdGE7XG5leHBvcnRzLmVuY29kZUN1c3RvbUF1dGhNZXRhZGF0YSA9IGVuY29kZUN1c3RvbUF1dGhNZXRhZGF0YTtcbmV4cG9ydHMuZW5jb2RlU2ltcGxlQXV0aE1ldGFkYXRhID0gZW5jb2RlU2ltcGxlQXV0aE1ldGFkYXRhO1xuZXhwb3J0cy5lbmNvZGVCZWFyZXJBdXRoTWV0YWRhdGEgPSBlbmNvZGVCZWFyZXJBdXRoTWV0YWRhdGE7XG5leHBvcnRzLmRlY29kZUF1dGhNZXRhZGF0YSA9IGRlY29kZUF1dGhNZXRhZGF0YTtcbmV4cG9ydHMuZGVjb2RlU2ltcGxlQXV0aFBheWxvYWQgPSBkZWNvZGVTaW1wbGVBdXRoUGF5bG9hZDtcblxudmFyIF9MaXRlQnVmZmVyID0gcmVxdWlyZSgnLi9MaXRlQnVmZmVyJyk7XG52YXIgX1JTb2NrZXRCdWZmZXJVdGlscyA9IHJlcXVpcmUoJy4vUlNvY2tldEJ1ZmZlclV0aWxzJyk7XG52YXIgX1dlbGxLbm93bkF1dGhUeXBlID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoXG4gIHJlcXVpcmUoJy4vV2VsbEtub3duQXV0aFR5cGUnKVxuKTtcbmZ1bmN0aW9uIF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpIHtcbiAgaWYgKHR5cGVvZiBXZWFrTWFwICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbDtcbiAgdmFyIGNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbiAgX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBjYWNoZTtcbiAgfTtcbiAgcmV0dXJuIGNhY2hlO1xufVxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG4gIGlmIChvYmogPT09IG51bGwgfHwgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmogIT09ICdmdW5jdGlvbicpKSB7XG4gICAgcmV0dXJuIHtkZWZhdWx0OiBvYmp9O1xuICB9XG4gIHZhciBjYWNoZSA9IF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSgpO1xuICBpZiAoY2FjaGUgJiYgY2FjaGUuaGFzKG9iaikpIHtcbiAgICByZXR1cm4gY2FjaGUuZ2V0KG9iaik7XG4gIH1cbiAgdmFyIG5ld09iaiA9IHt9O1xuICB2YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9yID1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvclxuICAgICAgICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpXG4gICAgICAgIDogbnVsbDtcbiAgICAgIGlmIChkZXNjICYmIChkZXNjLmdldCB8fCBkZXNjLnNldCkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld09iaiwga2V5LCBkZXNjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICBpZiAoY2FjaGUpIHtcbiAgICBjYWNoZS5zZXQob2JqLCBuZXdPYmopO1xuICB9XG4gIHJldHVybiBuZXdPYmo7XG59XG5cbmNvbnN0IGF1dGhUeXBlSWRCeXRlc0xlbmd0aCA9IDE7XG5jb25zdCBjdXN0b21BdXRoVHlwZUJ5dGVzTGVuZ3RoID0gMTtcbmNvbnN0IHVzZXJuYW1lTGVuZ3RoQnl0ZXNMZW5ndGggPSAyO1xuXG5jb25zdCBzdHJlYW1NZXRhZGF0YUtub3duTWFzayA9IDB4ODA7IC8vIDEwMDAgMDAwMFxuY29uc3Qgc3RyZWFtTWV0YWRhdGFMZW5ndGhNYXNrID0gMHg3ZjsgLy8gMDExMSAxMTExXG5cbi8qKlxuICogRW5jb2RlIEF1dGggbWV0YWRhdGEgd2l0aCB0aGUgZ2l2ZW4ge0BsaW5rIFdlbGxLbm93bkF1dGhUeXBlfSBhbmQgYXV0aCBwYXlsb2FkIHtAbGluayBCdWZmZXJ9XG4gKlxuICogQHBhcmFtIGF1dGhUeXBlIHdlbGwga25vd24gYXV0aCB0eXBlXG4gKiBAcGFyYW0gYXV0aFBheWxvYWRCdWZmZXIgYXV0aCBwYXlsb2FkIGJ1ZmZlclxuICogQHJldHVybnMgZW5jb2RlZCB7QGxpbmsgV2VsbEtub3duQXV0aFR5cGV9IGFuZCBwYXlsb2FkIHtAbGluayBCdWZmZXJ9XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVdlbGxLbm93bkF1dGhNZXRhZGF0YShhdXRoVHlwZSwgYXV0aFBheWxvYWRCdWZmZXIpIHtcbiAgaWYgKFxuICAgIGF1dGhUeXBlID09PSBfV2VsbEtub3duQXV0aFR5cGUuVU5QQVJTRUFCTEVfQVVUSF9UWVBFIHx8XG4gICAgYXV0aFR5cGUgPT09IF9XZWxsS25vd25BdXRoVHlwZS5VTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRVxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSWxsZWdhbCBXZWxsS25vd25BdXRoVHlwZVske2F1dGhUeXBlLnRvU3RyaW5nKCl9XS4gT25seSBhbGxvd2VkIEF1dGhUeXBlIHNob3VsZCBiZSB1c2VkYFxuICAgICk7XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKGF1dGhUeXBlSWRCeXRlc0xlbmd0aCk7XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2VcbiAgYnVmZmVyLndyaXRlVUludDgoYXV0aFR5cGUuaWRlbnRpZmllciB8IHN0cmVhbU1ldGFkYXRhS25vd25NYXNrKTtcblxuICByZXR1cm4gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5jb25jYXQoW2J1ZmZlciwgYXV0aFBheWxvYWRCdWZmZXJdKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgQXV0aCBtZXRhZGF0YSB3aXRoIHRoZSBnaXZlbiBjdXN0b20gYXV0aCB0eXBlIHtAbGluayBzdHJpbmd9IGFuZCBhdXRoIHBheWxvYWQge0BsaW5rIEJ1ZmZlcn1cbiAqXG4gKiBAcGFyYW0gY3VzdG9tQXV0aFR5cGUgY3VzdG9tIGF1dGggdHlwZVxuICogQHBhcmFtIGF1dGhQYXlsb2FkQnVmZmVyIGF1dGggcGF5bG9hZCBidWZmZXJcbiAqIEByZXR1cm5zIGVuY29kZWQge0BsaW5rIFdlbGxLbm93bkF1dGhUeXBlfSBhbmQgcGF5bG9hZCB7QGxpbmsgQnVmZmVyfVxuICovXG5mdW5jdGlvbiBlbmNvZGVDdXN0b21BdXRoTWV0YWRhdGEoY3VzdG9tQXV0aFR5cGUsIGF1dGhQYXlsb2FkQnVmZmVyKSB7XG4gIGNvbnN0IGN1c3RvbUF1dGhUeXBlQnVmZmVyID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMudG9CdWZmZXIpKFxuICAgIGN1c3RvbUF1dGhUeXBlXG4gICk7XG5cbiAgaWYgKGN1c3RvbUF1dGhUeXBlQnVmZmVyLmJ5dGVMZW5ndGggIT09IGN1c3RvbUF1dGhUeXBlLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIGF1dGggdHlwZSBtdXN0IGJlIFVTX0FTQ0lJIGNoYXJhY3RlcnMgb25seScpO1xuICB9XG4gIGlmIChcbiAgICBjdXN0b21BdXRoVHlwZUJ1ZmZlci5ieXRlTGVuZ3RoIDwgMSB8fFxuICAgIGN1c3RvbUF1dGhUeXBlQnVmZmVyLmJ5dGVMZW5ndGggPiAxMjhcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0N1c3RvbSBhdXRoIHR5cGUgbXVzdCBoYXZlIGEgc3RyaWN0bHkgcG9zaXRpdmUgbGVuZ3RoIHRoYXQgZml0cyBvbiA3IHVuc2lnbmVkIGJpdHMsIGllIDEtMTI4J1xuICAgICk7XG4gIH1cblxuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIGN1c3RvbUF1dGhUeXBlQnl0ZXNMZW5ndGggKyBjdXN0b21BdXRoVHlwZUJ1ZmZlci5ieXRlTGVuZ3RoXG4gICk7XG5cbiAgLy8gZW5jb2RlZCBsZW5ndGggaXMgb25lIGxlc3MgdGhhbiBhY3R1YWwgbGVuZ3RoLCBzaW5jZSAwIGlzIG5ldmVyIGEgdmFsaWQgbGVuZ3RoLCB3aGljaCBnaXZlc1xuICAvLyB3aWRlciByZXByZXNlbnRhdGlvbiByYW5nZVxuICBidWZmZXIud3JpdGVVSW50OChjdXN0b21BdXRoVHlwZUJ1ZmZlci5ieXRlTGVuZ3RoIC0gMSk7XG4gIGJ1ZmZlci53cml0ZShjdXN0b21BdXRoVHlwZSwgY3VzdG9tQXV0aFR5cGVCeXRlc0xlbmd0aCk7XG5cbiAgcmV0dXJuIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIuY29uY2F0KFtidWZmZXIsIGF1dGhQYXlsb2FkQnVmZmVyXSk7XG59XG5cbi8qKlxuICogRW5jb2RlIFNpbXBsZSBBdXRoIG1ldGFkYXRhIHdpdGggdGhlIGdpdmVuIHVzZXJuYW1lIGFuZCBwYXNzd29yZFxuICpcbiAqIEBwYXJhbSB1c2VybmFtZSB1c2VybmFtZVxuICogQHBhcmFtIHBhc3N3b3JkIHBhc3N3b3JkXG4gKiBAcmV0dXJucyBlbmNvZGVkIHtAbGluayBTSU1QTEV9IGFuZCBnaXZlbiB1c2VybmFtZSBhbmQgcGFzc3dvcmQgYXMgYXV0aCBwYXlsb2FkIHtAbGluayBCdWZmZXJ9XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVNpbXBsZUF1dGhNZXRhZGF0YSh1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgY29uc3QgdXNlcm5hbWVCdWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy50b0J1ZmZlcikodXNlcm5hbWUpO1xuICBjb25zdCBwYXNzd29yZEJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLnRvQnVmZmVyKShwYXNzd29yZCk7XG4gIGNvbnN0IHVzZXJuYW1lTGVuZ3RoID0gdXNlcm5hbWVCdWZmZXIuYnl0ZUxlbmd0aDtcblxuICBpZiAodXNlcm5hbWVMZW5ndGggPiA2NTUzNSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBVc2VybmFtZSBzaG91bGQgYmUgc2hvcnRlciB0aGFuIG9yIGVxdWFsIHRvIDY1NTM1IGJ5dGVzIGxlbmd0aCBpbiBVVEYtOCBlbmNvZGluZyBidXQgdGhlIGdpdmVuIHdhcyAke3VzZXJuYW1lTGVuZ3RofWBcbiAgICApO1xuICB9XG5cbiAgY29uc3QgY2FwYWNpdHkgPSBhdXRoVHlwZUlkQnl0ZXNMZW5ndGggKyB1c2VybmFtZUxlbmd0aEJ5dGVzTGVuZ3RoO1xuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKGNhcGFjaXR5KTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuICBidWZmZXIud3JpdGVVSW50OChcbiAgICBfV2VsbEtub3duQXV0aFR5cGUuU0lNUExFLmlkZW50aWZpZXIgfCBzdHJlYW1NZXRhZGF0YUtub3duTWFza1xuICApO1xuICBidWZmZXIud3JpdGVVSW50MTZCRSh1c2VybmFtZUxlbmd0aCwgMSk7XG5cbiAgcmV0dXJuIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIuY29uY2F0KFtcbiAgICBidWZmZXIsXG4gICAgdXNlcm5hbWVCdWZmZXIsXG4gICAgcGFzc3dvcmRCdWZmZXIsXG4gIF0pO1xufVxuXG4vKipcbiAqIEVuY29kZSBCZWFyZXIgQXV0aCBtZXRhZGF0YSB3aXRoIHRoZSBnaXZlbiB0b2tlblxuICpcbiAqIEBwYXJhbSB0b2tlbiB0b2tlblxuICogQHJldHVybnMgZW5jb2RlZCB7QGxpbmsgQkVBUkVSfSBhbmQgZ2l2ZW4gdG9rZW4gYXMgYXV0aCBwYXlsb2FkIHtAbGluayBCdWZmZXJ9XG4gKi9cbmZ1bmN0aW9uIGVuY29kZUJlYXJlckF1dGhNZXRhZGF0YSh0b2tlbikge1xuICBjb25zdCB0b2tlbkJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLnRvQnVmZmVyKSh0b2tlbik7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoYXV0aFR5cGVJZEJ5dGVzTGVuZ3RoKTtcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuICBidWZmZXIud3JpdGVVSW50OChcbiAgICBfV2VsbEtub3duQXV0aFR5cGUuQkVBUkVSLmlkZW50aWZpZXIgfCBzdHJlYW1NZXRhZGF0YUtub3duTWFza1xuICApO1xuXG4gIHJldHVybiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmNvbmNhdChbYnVmZmVyLCB0b2tlbkJ1ZmZlcl0pO1xufVxuXG4vKipcbiAqIERlY29kZSBhdXRoIG1ldGFkYXRhIHtAbGluayBCdWZmZXJ9IGludG8ge0BsaW5rIEF1dGhNZXRhZGF0YX0gb2JqZWN0XG4gKlxuICogQHBhcmFtIG1ldGFkYXRhIGF1dGggbWV0YWRhdGEge0BsaW5rIEJ1ZmZlcn1cbiAqIEByZXR1cm5zIGRlY29kZWQge0BsaW5rIEF1dGhNZXRhZGF0YX1cbiAqL1xuZnVuY3Rpb24gZGVjb2RlQXV0aE1ldGFkYXRhKG1ldGFkYXRhKSB7XG4gIGlmIChtZXRhZGF0YS5ieXRlTGVuZ3RoIDwgMSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdVbmFibGUgdG8gZGVjb2RlIEF1dGggbWV0YWRhdGEuIE5vdCBlbm91Z2ggcmVhZGFibGUgYnl0ZXMnXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IGxlbmd0aE9ySWQgPSBtZXRhZGF0YS5yZWFkVUludDgoKTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWJpdHdpc2VcbiAgY29uc3Qgbm9ybWFsaXplZElkID0gbGVuZ3RoT3JJZCAmIHN0cmVhbU1ldGFkYXRhTGVuZ3RoTWFzaztcblxuICBpZiAobm9ybWFsaXplZElkICE9PSBsZW5ndGhPcklkKSB7XG4gICAgY29uc3QgYXV0aFR5cGUgPSBfV2VsbEtub3duQXV0aFR5cGUuZGVmYXVsdC5mcm9tSWRlbnRpZmllcihub3JtYWxpemVkSWQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBheWxvYWQ6IG1ldGFkYXRhLnNsaWNlKDEpLFxuICAgICAgdHlwZToge1xuICAgICAgICBpZGVudGlmaWVyOiBhdXRoVHlwZS5pZGVudGlmaWVyLFxuICAgICAgICBzdHJpbmc6IGF1dGhUeXBlLnN0cmluZyxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBlbmNvZGVkIGxlbmd0aCBpcyByZWFsTGVuZ3RoIC0gMSBpbiBvcmRlciB0byBhdm9pZCBpbnRlcnNlY3Rpb24gd2l0aCAweDAwIGF1dGh0eXBlXG4gICAgY29uc3QgcmVhbExlbmd0aCA9IGxlbmd0aE9ySWQgKyAxO1xuICAgIGlmIChtZXRhZGF0YS5ieXRlTGVuZ3RoIDwgcmVhbExlbmd0aCArIGN1c3RvbUF1dGhUeXBlQnl0ZXNMZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1VuYWJsZSB0byBkZWNvZGUgY3VzdG9tIEF1dGggdHlwZS4gTWFsZm9ybWVkIGxlbmd0aCBvciBhdXRoIHR5cGUgc3RyaW5nJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjdXN0b21BdXRoVHlwZVN0cmluZyA9IG1ldGFkYXRhLnRvU3RyaW5nKFxuICAgICAgJ3V0ZjgnLFxuICAgICAgY3VzdG9tQXV0aFR5cGVCeXRlc0xlbmd0aCxcbiAgICAgIGN1c3RvbUF1dGhUeXBlQnl0ZXNMZW5ndGggKyByZWFsTGVuZ3RoXG4gICAgKTtcblxuICAgIGNvbnN0IHBheWxvYWQgPSBtZXRhZGF0YS5zbGljZShyZWFsTGVuZ3RoICsgY3VzdG9tQXV0aFR5cGVCeXRlc0xlbmd0aCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcGF5bG9hZCxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgaWRlbnRpZmllcjogX1dlbGxLbm93bkF1dGhUeXBlLlVOUEFSU0VBQkxFX0FVVEhfVFlQRS5pZGVudGlmaWVyLFxuICAgICAgICBzdHJpbmc6IGN1c3RvbUF1dGhUeXBlU3RyaW5nLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogUmVhZCB1cCB0byAxMjkgYnl0ZXMgZnJvbSB0aGUgZ2l2ZW4gbWV0YWRhdGEgaW4gb3JkZXIgdG8gZ2V0IHRoZSBjdXN0b20gQXV0aCBUeXBlXG4gKlxuICogQHBhcmFtIGF1dGhQYXlsb2FkXG4gKiBAcmV0dXJuIHNsaWNlZCB1c2VybmFtZSBhbmQgcGFzc3dvcmQgYnVmZmVyc1xuICovXG5mdW5jdGlvbiBkZWNvZGVTaW1wbGVBdXRoUGF5bG9hZChhdXRoUGF5bG9hZCkge1xuICBpZiAoYXV0aFBheWxvYWQuYnl0ZUxlbmd0aCA8IHVzZXJuYW1lTGVuZ3RoQnl0ZXNMZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnVW5hYmxlIHRvIGRlY29kZSBTaW1wbGUgQXV0aCBQYXlsb2FkLiBOb3QgZW5vdWdoIHJlYWRhYmxlIGJ5dGVzJ1xuICAgICk7XG4gIH1cblxuICBjb25zdCB1c2VybmFtZUxlbmd0aCA9IGF1dGhQYXlsb2FkLnJlYWRVSW50MTZCRSgpO1xuXG4gIGlmIChhdXRoUGF5bG9hZC5ieXRlTGVuZ3RoIDwgdXNlcm5hbWVMZW5ndGggKyB1c2VybmFtZUxlbmd0aEJ5dGVzTGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1VuYWJsZSB0byBkZWNvZGUgU2ltcGxlIEF1dGggUGF5bG9hZC4gTm90IGVub3VnaCByZWFkYWJsZSBieXRlcydcbiAgICApO1xuICB9XG5cbiAgY29uc3QgdXNlcm5hbWUgPSBhdXRoUGF5bG9hZC5zbGljZShcbiAgICB1c2VybmFtZUxlbmd0aEJ5dGVzTGVuZ3RoLFxuICAgIHVzZXJuYW1lTGVuZ3RoQnl0ZXNMZW5ndGggKyB1c2VybmFtZUxlbmd0aFxuICApO1xuXG4gIGNvbnN0IHBhc3N3b3JkID0gYXV0aFBheWxvYWQuc2xpY2UoXG4gICAgdXNlcm5hbWVMZW5ndGhCeXRlc0xlbmd0aCArIHVzZXJuYW1lTGVuZ3RoXG4gICk7XG5cbiAgcmV0dXJuIHtwYXNzd29yZCwgdXNlcm5hbWV9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5leHBvcnRzLmVuY29kZUNvbXBvc2l0ZU1ldGFkYXRhID0gZW5jb2RlQ29tcG9zaXRlTWV0YWRhdGE7XG5leHBvcnRzLmVuY29kZUFuZEFkZEN1c3RvbU1ldGFkYXRhID0gZW5jb2RlQW5kQWRkQ3VzdG9tTWV0YWRhdGE7XG5leHBvcnRzLmVuY29kZUFuZEFkZFdlbGxLbm93bk1ldGFkYXRhID0gZW5jb2RlQW5kQWRkV2VsbEtub3duTWV0YWRhdGE7XG5leHBvcnRzLmRlY29kZU1pbWVBbmRDb250ZW50QnVmZmVyc1NsaWNlcyA9IGRlY29kZU1pbWVBbmRDb250ZW50QnVmZmVyc1NsaWNlcztcbmV4cG9ydHMuZGVjb2RlTWltZVR5cGVGcm9tTWltZUJ1ZmZlciA9IGRlY29kZU1pbWVUeXBlRnJvbU1pbWVCdWZmZXI7XG5leHBvcnRzLmVuY29kZUN1c3RvbU1ldGFkYXRhSGVhZGVyID0gZW5jb2RlQ3VzdG9tTWV0YWRhdGFIZWFkZXI7XG5leHBvcnRzLmVuY29kZVdlbGxLbm93bk1ldGFkYXRhSGVhZGVyID0gZW5jb2RlV2VsbEtub3duTWV0YWRhdGFIZWFkZXI7XG5leHBvcnRzLmRlY29kZUNvbXBvc2l0ZU1ldGFkYXRhID0gZGVjb2RlQ29tcG9zaXRlTWV0YWRhdGE7XG5leHBvcnRzLldlbGxLbm93bk1pbWVUeXBlRW50cnkgPSBleHBvcnRzLlJlc2VydmVkTWltZVR5cGVFbnRyeSA9IGV4cG9ydHMuRXhwbGljaXRNaW1lVGltZUVudHJ5ID0gZXhwb3J0cy5Db21wb3NpdGVNZXRhZGF0YSA9IHZvaWQgMDtcblxudmFyIF9MaXRlQnVmZmVyID0gcmVxdWlyZSgnLi9MaXRlQnVmZmVyJyk7XG52YXIgX1JTb2NrZXRCdWZmZXJVdGlscyA9IHJlcXVpcmUoJy4vUlNvY2tldEJ1ZmZlclV0aWxzJyk7XG5cbnZhciBfV2VsbEtub3duTWltZVR5cGUgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChcbiAgcmVxdWlyZSgnLi9XZWxsS25vd25NaW1lVHlwZScpXG4pO1xuZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkge1xuICBpZiAodHlwZW9mIFdlYWtNYXAgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsO1xuICB2YXIgY2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuICBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9O1xuICByZXR1cm4gY2FjaGU7XG59XG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJykpIHtcbiAgICByZXR1cm4ge2RlZmF1bHQ6IG9ian07XG4gIH1cbiAgdmFyIGNhY2hlID0gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCk7XG4gIGlmIChjYWNoZSAmJiBjYWNoZS5oYXMob2JqKSkge1xuICAgIHJldHVybiBjYWNoZS5nZXQob2JqKTtcbiAgfVxuICB2YXIgbmV3T2JqID0ge307XG4gIHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHZhciBkZXNjID0gaGFzUHJvcGVydHlEZXNjcmlwdG9yXG4gICAgICAgID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSlcbiAgICAgICAgOiBudWxsO1xuICAgICAgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gIGlmIChjYWNoZSkge1xuICAgIGNhY2hlLnNldChvYmosIG5ld09iaik7XG4gIH1cbiAgcmV0dXJuIG5ld09iajtcbn1cblxuLy8gJEZsb3dGaXhNZVxuY2xhc3MgQ29tcG9zaXRlTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihidWZmZXIpIHtcbiAgICB0aGlzLl9idWZmZXIgPSBidWZmZXI7XG4gIH1cblxuICBpdGVyYXRvcigpIHtcbiAgICByZXR1cm4gZGVjb2RlQ29tcG9zaXRlTWV0YWRhdGEodGhpcy5fYnVmZmVyKTtcbiAgfVxuXG4gIC8vICRGbG93Rml4TWVcbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG4gICAgcmV0dXJuIGRlY29kZUNvbXBvc2l0ZU1ldGFkYXRhKHRoaXMuX2J1ZmZlcik7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmNvZGUgYW4gb2JqZWN0IHdoZXJlIGtleSBpcyBlaXRoZXIge0BsaW5rIFdlbGxLbm93bk1pbWVUeXBlfSBvciB7QGxpbmsgc3RyaW5nfVxuICogYW5kIHZhbHVlIGFzIGEge0BsaW5rIEJ1ZmZlcn0gaW50byBjb21wb3NpdGUgbWV0YWRhdGEge0BsaW5rIEJ1ZmZlcn1cbiAqXG4gKiBAcGFyYW0gbWV0YWRhdGEga2V5LXZhbHVlIGJhc2VkIG9iamVjdFxuICogQHJldHVybnMge0J1ZmZlcn1cbiAqLyBleHBvcnRzLkNvbXBvc2l0ZU1ldGFkYXRhID0gQ29tcG9zaXRlTWV0YWRhdGE7XG5mdW5jdGlvbiBlbmNvZGVDb21wb3NpdGVNZXRhZGF0YShtZXRhZGF0YSkge1xuICBsZXQgZW5jb2RlZENvbXBvc2l0ZU1ldGFkYXRhID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMuY3JlYXRlQnVmZmVyKSgwKTtcbiAgZm9yIChjb25zdCBbbWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWVdIG9mIG1ldGFkYXRhKSB7XG4gICAgY29uc3QgbWV0YWRhdGFSZWFsVmFsdWUgPVxuICAgICAgdHlwZW9mIG1ldGFkYXRhVmFsdWUgPT09ICdmdW5jdGlvbicgPyBtZXRhZGF0YVZhbHVlKCkgOiBtZXRhZGF0YVZhbHVlO1xuXG4gICAgaWYgKFxuICAgICAgbWV0YWRhdGFLZXkgaW5zdGFuY2VvZiBfV2VsbEtub3duTWltZVR5cGUuZGVmYXVsdCB8fFxuICAgICAgdHlwZW9mIG1ldGFkYXRhS2V5ID09PSAnbnVtYmVyJyB8fFxuICAgICAgbWV0YWRhdGFLZXkuY29uc3RydWN0b3IubmFtZSA9PT0gJ1dlbGxLbm93bk1pbWVUeXBlJ1xuICAgICkge1xuICAgICAgZW5jb2RlZENvbXBvc2l0ZU1ldGFkYXRhID0gZW5jb2RlQW5kQWRkV2VsbEtub3duTWV0YWRhdGEoXG4gICAgICAgIGVuY29kZWRDb21wb3NpdGVNZXRhZGF0YSxcbiAgICAgICAgbWV0YWRhdGFLZXksXG4gICAgICAgIG1ldGFkYXRhUmVhbFZhbHVlXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGVkQ29tcG9zaXRlTWV0YWRhdGEgPSBlbmNvZGVBbmRBZGRDdXN0b21NZXRhZGF0YShcbiAgICAgICAgZW5jb2RlZENvbXBvc2l0ZU1ldGFkYXRhLFxuICAgICAgICBtZXRhZGF0YUtleSxcbiAgICAgICAgbWV0YWRhdGFSZWFsVmFsdWVcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGVuY29kZWRDb21wb3NpdGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBuZXcgc3ViLW1ldGFkYXRhIGluZm9ybWF0aW9uIGludG8gYSBjb21wb3NpdGUgbWV0YWRhdGEge0BsaW5rIENvbXBvc2l0ZUJ5dGVCdWZcbiAqIGJ1ZmZlcn0sIHdpdGhvdXQgY2hlY2tpbmcgaWYgdGhlIHtAbGluayBTdHJpbmd9IGNhbiBiZSBtYXRjaGVkIHdpdGggYSB3ZWxsIGtub3duIGNvbXByZXNzYWJsZVxuICogbWltZSB0eXBlLiBQcmVmZXIgdXNpbmcgdGhpcyBtZXRob2QgYW5kIHtAbGluayAjZW5jb2RlQW5kQWRkTWV0YWRhdGEoQ29tcG9zaXRlQnl0ZUJ1ZixcbiAqIEJ5dGVCdWZBbGxvY2F0b3IsIFdlbGxLbm93bk1pbWVUeXBlLCBCeXRlQnVmKX0gaWYgeW91IGtub3cgaW4gYWR2YW5jZSB3aGV0aGVyIG9yIG5vdCB0aGUgbWltZVxuICogaXMgd2VsbCBrbm93bi4gT3RoZXJ3aXNlIHVzZSB7QGxpbmsgI2VuY29kZUFuZEFkZE1ldGFkYXRhV2l0aENvbXByZXNzaW9uKENvbXBvc2l0ZUJ5dGVCdWYsXG4gKiBCeXRlQnVmQWxsb2NhdG9yLCBTdHJpbmcsIEJ5dGVCdWYpfVxuICpcbiAqIEBwYXJhbSBjb21wb3NpdGVNZXRhRGF0YSB0aGUgYnVmZmVyIHRoYXQgd2lsbCBob2xkIGFsbCBjb21wb3NpdGUgbWV0YWRhdGEgaW5mb3JtYXRpb24uXG4gKiBAcGFyYW0gYWxsb2NhdG9yIHRoZSB7QGxpbmsgQnl0ZUJ1ZkFsbG9jYXRvcn0gdG8gdXNlIHRvIGNyZWF0ZSBpbnRlcm1lZGlhdGUgYnVmZmVycyBhcyBuZWVkZWQuXG4gKiBAcGFyYW0gY3VzdG9tTWltZVR5cGUgdGhlIGN1c3RvbSBtaW1lIHR5cGUgdG8gZW5jb2RlLlxuICogQHBhcmFtIG1ldGFkYXRhIHRoZSBtZXRhZGF0YSB2YWx1ZSB0byBlbmNvZGUuXG4gKi9cbi8vIHNlZSAjZW5jb2RlTWV0YWRhdGFIZWFkZXIoQnl0ZUJ1ZkFsbG9jYXRvciwgU3RyaW5nLCBpbnQpXG5mdW5jdGlvbiBlbmNvZGVBbmRBZGRDdXN0b21NZXRhZGF0YShcbiAgY29tcG9zaXRlTWV0YURhdGEsXG4gIGN1c3RvbU1pbWVUeXBlLFxuICBtZXRhZGF0YVxuKSB7XG4gIHJldHVybiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmNvbmNhdChbXG4gICAgY29tcG9zaXRlTWV0YURhdGEsXG4gICAgZW5jb2RlQ3VzdG9tTWV0YWRhdGFIZWFkZXIoY3VzdG9tTWltZVR5cGUsIG1ldGFkYXRhLmJ5dGVMZW5ndGgpLFxuICAgIG1ldGFkYXRhLFxuICBdKTtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSBuZXcgc3ViLW1ldGFkYXRhIGluZm9ybWF0aW9uIGludG8gYSBjb21wb3NpdGUgbWV0YWRhdGEge0BsaW5rIENvbXBvc2l0ZUJ5dGVCdWZcbiAqIGJ1ZmZlcn0uXG4gKlxuICogQHBhcmFtIGNvbXBvc2l0ZU1ldGFkYXRhIHRoZSBidWZmZXIgdGhhdCB3aWxsIGhvbGQgYWxsIGNvbXBvc2l0ZSBtZXRhZGF0YSBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSBhbGxvY2F0b3IgdGhlIHtAbGluayBCeXRlQnVmQWxsb2NhdG9yfSB0byB1c2UgdG8gY3JlYXRlIGludGVybWVkaWF0ZSBidWZmZXJzIGFzIG5lZWRlZC5cbiAqIEBwYXJhbSBrbm93bk1pbWVUeXBlIHRoZSB7QGxpbmsgV2VsbEtub3duTWltZVR5cGV9IHRvIGVuY29kZS5cbiAqIEBwYXJhbSBtZXRhZGF0YSB0aGUgbWV0YWRhdGEgdmFsdWUgdG8gZW5jb2RlLlxuICovXG4vLyBzZWUgI2VuY29kZU1ldGFkYXRhSGVhZGVyKEJ5dGVCdWZBbGxvY2F0b3IsIGJ5dGUsIGludClcbmZ1bmN0aW9uIGVuY29kZUFuZEFkZFdlbGxLbm93bk1ldGFkYXRhKFxuICBjb21wb3NpdGVNZXRhZGF0YSxcbiAga25vd25NaW1lVHlwZSxcbiAgbWV0YWRhdGFcbikge1xuICBsZXQgbWltZVR5cGVJZDtcblxuICBpZiAoTnVtYmVyLmlzSW50ZWdlcihrbm93bk1pbWVUeXBlKSkge1xuICAgIG1pbWVUeXBlSWQgPSBrbm93bk1pbWVUeXBlO1xuICB9IGVsc2Uge1xuICAgIG1pbWVUeXBlSWQgPSBrbm93bk1pbWVUeXBlLmlkZW50aWZpZXI7XG4gIH1cblxuICByZXR1cm4gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5jb25jYXQoW1xuICAgIGNvbXBvc2l0ZU1ldGFkYXRhLFxuICAgIGVuY29kZVdlbGxLbm93bk1ldGFkYXRhSGVhZGVyKG1pbWVUeXBlSWQsIG1ldGFkYXRhLmJ5dGVMZW5ndGgpLFxuICAgIG1ldGFkYXRhLFxuICBdKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgdGhlIG5leHQgbWV0YWRhdGEgZW50cnkgKGEgbWltZSBoZWFkZXIgKyBjb250ZW50IHBhaXIgb2Yge0BsaW5rIEJ5dGVCdWZ9KSBmcm9tICAgYSB7QGxpbmtcbiAqIEJ5dGVCdWZ9IHRoYXQgY29udGFpbnMgYXQgbGVhc3QgZW5vdWdoIGJ5dGVzIGZvciBvbmUgbW9yZSBzdWNoIGVudHJ5LiBUaGVzZSBidWZmZXJzIGFyZVxuICogYWN0dWFsbHkgc2xpY2VzIG9mIHRoZSBmdWxsIG1ldGFkYXRhIGJ1ZmZlciwgYW5kIHRoaXMgbWV0aG9kIGRvZXNuJ3QgbW92ZSB0aGUgZnVsbCBtZXRhZGF0YVxuICogYnVmZmVyJ3Mge0BsaW5rIEJ5dGVCdWYjcmVhZGVySW5kZXgoKX0uIEFzIHN1Y2gsIGl0IHJlcXVpcmVzIHRoZSB1c2VyIHRvIHByb3ZpZGUgYW4ge0Bjb2RlXG4gKiBpbmRleH0gdG8gcmVhZCBmcm9tLiBUaGUgbmV4dCBpbmRleCBpcyBjb21wdXRlZCBieSBjYWxsaW5nIHtAbGluayAjY29tcHV0ZU5leHRFbnRyeUluZGV4KGludCxcbiAqIEJ5dGVCdWYsIEJ5dGVCdWYpfS4gU2l6ZSBvZiB0aGUgZmlyc3QgYnVmZmVyICh0aGUgXCJoZWFkZXIgYnVmZmVyXCIpIGRyaXZlcyB3aGljaCBkZWNvZGluZyBtZXRob2RcbiAqIHNob3VsZCBiZSBmdXJ0aGVyIGFwcGxpZWQgdG8gaXQuXG4gKlxuICogPHA+VGhlIGhlYWRlciBidWZmZXIgaXMgZWl0aGVyOlxuICpcbiAqIDx1bD5cbiAqICAgPGxpPm1hZGUgdXAgb2YgYSBzaW5nbGUgYnl0ZTogdGhpcyByZXByZXNlbnRzIGFuIGVuY29kZWQgbWltZSBpZCwgd2hpY2ggY2FuIGJlIGZ1cnRoZXJcbiAqICAgICAgIGRlY29kZWQgdXNpbmcge0BsaW5rICNkZWNvZGVNaW1lSWRGcm9tTWltZUJ1ZmZlcihCeXRlQnVmKX1cbiAqICAgPGxpPm1hZGUgdXAgb2YgMiBvciBtb3JlIGJ5dGVzOiB0aGlzIHJlcHJlc2VudHMgYW4gZW5jb2RlZCBtaW1lIFN0cmluZyArIGl0cyBsZW5ndGgsIHdoaWNoXG4gKiAgICAgICBjYW4gYmUgZnVydGhlciBkZWNvZGVkIHVzaW5nIHtAbGluayAjZGVjb2RlTWltZVR5cGVGcm9tTWltZUJ1ZmZlcihCeXRlQnVmKX0uIE5vdGUgdGhlXG4gKiAgICAgICBlbmNvZGVkIGxlbmd0aCwgaW4gdGhlIGZpcnN0IGJ5dGUsIGlzIHNraXBwZWQgYnkgdGhpcyBkZWNvZGluZyBtZXRob2QgYmVjYXVzZSB0aGVcbiAqICAgICAgIHJlbWFpbmluZyBsZW5ndGggb2YgdGhlIGJ1ZmZlciBpcyB0aGF0IG9mIHRoZSBtaW1lIHN0cmluZy5cbiAqIDwvdWw+XG4gKlxuICogQHBhcmFtIGNvbXBvc2l0ZU1ldGFkYXRhIHRoZSBzb3VyY2Uge0BsaW5rIEJ5dGVCdWZ9IHRoYXQgb3JpZ2luYWxseSBjb250YWlucyBvbmUgb3IgbW9yZVxuICogICAgIG1ldGFkYXRhIGVudHJpZXNcbiAqIEBwYXJhbSBlbnRyeUluZGV4IHRoZSB7QGxpbmsgQnl0ZUJ1ZiNyZWFkZXJJbmRleCgpfSB0byBzdGFydCBkZWNvZGluZyBmcm9tLiBvcmlnaW5hbCByZWFkZXJcbiAqICAgICBpbmRleCBpcyBrZXB0IG9uIHRoZSBzb3VyY2UgYnVmZmVyXG4gKiBAcGFyYW0gcmV0YWluU2xpY2VzIHNob3VsZCBwcm9kdWNlZCBtZXRhZGF0YSBlbnRyeSBidWZmZXJzIHtAbGluayBCeXRlQnVmI3NsaWNlKCkgc2xpY2VzfSBiZVxuICogICAgIHtAbGluayBCeXRlQnVmI3JldGFpbmVkU2xpY2UoKSByZXRhaW5lZH0/XG4gKiBAcmV0dXJuIGEge0BsaW5rIEJ5dGVCdWZ9IGFycmF5IG9mIGxlbmd0aCAyIGNvbnRhaW5pbmcgdGhlIG1pbWUgaGVhZGVyIGJ1ZmZlclxuICogICAgIDxzdHJvbmc+c2xpY2U8L3N0cm9uZz4gYW5kIHRoZSBjb250ZW50IGJ1ZmZlciA8c3Ryb25nPnNsaWNlPC9zdHJvbmc+LCBvciBvbmUgb2YgdGhlXG4gKiAgICAgemVyby1sZW5ndGggZXJyb3IgY29uc3RhbnQgYXJyYXlzXG4gKi9cbmZ1bmN0aW9uIGRlY29kZU1pbWVBbmRDb250ZW50QnVmZmVyc1NsaWNlcyhjb21wb3NpdGVNZXRhZGF0YSwgZW50cnlJbmRleCkge1xuICBjb25zdCBtaW1lSWRPckxlbmd0aCA9IGNvbXBvc2l0ZU1ldGFkYXRhLnJlYWRJbnQ4KGVudHJ5SW5kZXgpO1xuICBsZXQgbWltZTtcbiAgbGV0IHRvU2tpcCA9IGVudHJ5SW5kZXg7XG4gIGlmIChcbiAgICAobWltZUlkT3JMZW5ndGggJiBTVFJFQU1fTUVUQURBVEFfS05PV05fTUFTSykgPT09XG4gICAgU1RSRUFNX01FVEFEQVRBX0tOT1dOX01BU0tcbiAgKSB7XG4gICAgbWltZSA9IGNvbXBvc2l0ZU1ldGFkYXRhLnNsaWNlKHRvU2tpcCwgdG9Ta2lwICsgMSk7XG4gICAgdG9Ta2lwICs9IDE7XG4gIH0gZWxzZSB7XG4gICAgLy8gTSBmbGFnIHVuc2V0LCByZW1haW5pbmcgNyBiaXRzIGFyZSB0aGUgbGVuZ3RoIG9mIHRoZSBtaW1lXG4gICAgY29uc3QgbWltZUxlbmd0aCA9IChtaW1lSWRPckxlbmd0aCAmIDB4ZmYpICsgMTtcblxuICAgIGlmIChjb21wb3NpdGVNZXRhZGF0YS5ieXRlTGVuZ3RoID4gdG9Ta2lwICsgbWltZUxlbmd0aCkge1xuICAgICAgLy8gbmVlZCB0byBiZSBhYmxlIHRvIHJlYWQgYW4gZXh0cmEgbWltZUxlbmd0aCBieXRlcyAod2UgaGF2ZSBhbHJlYWR5IHJlYWQgb25lIHNvIGJ5dGVMZW5ndGggc2hvdWxkIGJlIHN0cmljdGx5IG1vcmUpXG4gICAgICAvLyBoZXJlIHdlIG5lZWQgYSB3YXkgZm9yIHRoZSByZXR1cm5lZCBCeXRlQnVmIHRvIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBhXG4gICAgICAvLyAxLWJ5dGUgbGVuZ3RoIG1pbWUgdHlwZSBhbmQgYSAxIGJ5dGUgZW5jb2RlZCBtaW1lIGlkLCBwcmVmZXJhYmx5IHdpdGhvdXRcbiAgICAgIC8vIHJlLWFwcGx5aW5nIHRoZSBieXRlIG1hc2suIFRoZSBlYXNpZXN0IHdheSBpcyB0byBpbmNsdWRlIHRoZSBpbml0aWFsIGJ5dGVcbiAgICAgIC8vIGFuZCBoYXZlIGZ1cnRoZXIgZGVjb2RpbmcgaWdub3JlIHRoZSBmaXJzdCBieXRlLiAxIGJ5dGUgYnVmZmVyID09IGlkLCAyKyBieXRlXG4gICAgICAvLyBidWZmZXIgPT0gZnVsbCBtaW1lIHN0cmluZy5cbiAgICAgIG1pbWUgPSBjb21wb3NpdGVNZXRhZGF0YS5zbGljZSh0b1NraXAsIHRvU2tpcCArIG1pbWVMZW5ndGggKyAxKTtcblxuICAgICAgLy8gd2UgdGh1cyBuZWVkIHRvIHNraXAgdGhlIGJ5dGVzIHdlIGp1c3Qgc2xpY2VkLCBidXQgbm90IHRoZSBmbGFnL2xlbmd0aCBieXRlXG4gICAgICAvLyB3aGljaCB3YXMgYWxyZWFkeSBza2lwcGVkIGluIGluaXRpYWwgcmVhZFxuICAgICAgdG9Ta2lwICs9IG1pbWVMZW5ndGggKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdNZXRhZGF0YSBpcyBtYWxmb3JtZWQuIEluYXBwcm9wcmlhdGVseSBmb3JtZWQgTWltZSBMZW5ndGgnXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb21wb3NpdGVNZXRhZGF0YS5ieXRlTGVuZ3RoID49IHRvU2tpcCArIDMpIHtcbiAgICAvLyBlbnN1cmVzIHRoZSBsZW5ndGggbWVkaXVtIGNhbiBiZSByZWFkXG4gICAgY29uc3QgbWV0YWRhdGFMZW5ndGggPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5yZWFkVUludDI0QkUpKFxuICAgICAgY29tcG9zaXRlTWV0YWRhdGEsXG4gICAgICB0b1NraXBcbiAgICApO1xuICAgIHRvU2tpcCArPSAzO1xuICAgIGlmIChjb21wb3NpdGVNZXRhZGF0YS5ieXRlTGVuZ3RoID49IG1ldGFkYXRhTGVuZ3RoICsgdG9Ta2lwKSB7XG4gICAgICBjb25zdCBtZXRhZGF0YSA9IGNvbXBvc2l0ZU1ldGFkYXRhLnNsaWNlKHRvU2tpcCwgdG9Ta2lwICsgbWV0YWRhdGFMZW5ndGgpO1xuICAgICAgcmV0dXJuIFttaW1lLCBtZXRhZGF0YV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ01ldGFkYXRhIGlzIG1hbGZvcm1lZC4gSW5hcHByb3ByaWF0ZWx5IGZvcm1lZCBNZXRhZGF0YSBMZW5ndGggb3IgbWFsZm9ybWVkIGNvbnRlbnQnXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnTWV0YWRhdGEgaXMgbWFsZm9ybWVkLiBNZXRhZGF0YSBMZW5ndGggaXMgYWJzZW50IG9yIG1hbGZvcm1lZCdcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogRGVjb2RlIGEge0BsaW5rIENoYXJTZXF1ZW5jZX0gY3VzdG9tZSBtaW1lIHR5cGUgZnJvbSBhIHtAbGluayBCeXRlQnVmfSwgYXNzdW1pbmcgc2FpZCBidWZmZXJcbiAqIHByb3Blcmx5IGNvbnRhaW5zIHN1Y2ggYSBtaW1lIHR5cGUuXG4gKlxuICogPHA+VGhlIGJ1ZmZlciBtdXN0IGF0IGxlYXN0IGhhdmUgdHdvIHJlYWRhYmxlIGJ5dGVzLCB3aGljaCBkaXN0aW5ndWlzaGVzIGl0IGZyb20gdGhlIHtAbGlua1xuICogI2RlY29kZU1pbWVJZEZyb21NaW1lQnVmZmVyKEJ5dGVCdWYpIGNvbXByZXNzZWQgaWR9IGNhc2UuIFRoZSBmaXJzdCBieXRlIGlzIGEgc2l6ZSBhbmQgdGhlXG4gKiByZW1haW5pbmcgYnl0ZXMgbXVzdCBjb3JyZXNwb25kIHRvIHRoZSB7QGxpbmsgQ2hhclNlcXVlbmNlfSwgZW5jb2RlZCBmdWxseSBpbiBVU19BU0NJSS4gQXMgYVxuICogcmVzdWx0LCB0aGUgZmlyc3QgYnl0ZSBjYW4gc2ltcGx5IGJlIHNraXBwZWQsIGFuZCB0aGUgcmVtYWluaW5nIG9mIHRoZSBidWZmZXIgYmUgZGVjb2RlZCB0byB0aGVcbiAqIG1pbWUgdHlwZS5cbiAqXG4gKiA8cD5JZiB0aGUgbWltZSBoZWFkZXIgYnVmZmVyIGlzIGxlc3MgdGhhbiAyIGJ5dGVzIGxvbmcsIHJldHVybnMge0Bjb2RlIG51bGx9LlxuICpcbiAqIEBwYXJhbSBmbHl3ZWlnaHRNaW1lQnVmZmVyIHRoZSBtaW1lIGhlYWRlciB7QGxpbmsgQnl0ZUJ1Zn0gdGhhdCBjb250YWlucyBsZW5ndGggKyBjdXN0b20gbWltZVxuICogICAgIHR5cGVcbiAqIEByZXR1cm4gdGhlIGRlY29kZWQgY3VzdG9tIG1pbWUgdHlwZSwgYXMgYSB7QGxpbmsgQ2hhclNlcXVlbmNlfSwgb3IgbnVsbCBpZiB0aGUgaW5wdXQgaXNcbiAqICAgICBpbnZhbGlkXG4gKiBAc2VlICNkZWNvZGVNaW1lSWRGcm9tTWltZUJ1ZmZlcihCeXRlQnVmKVxuICovXG5mdW5jdGlvbiBkZWNvZGVNaW1lVHlwZUZyb21NaW1lQnVmZmVyKGZseXdlaWdodE1pbWVCdWZmZXIpIHtcbiAgaWYgKGZseXdlaWdodE1pbWVCdWZmZXIubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5hYmxlIHRvIGRlY29kZSBleHBsaWNpdCBNSU1FIHR5cGUnKTtcbiAgfVxuICAvLyB0aGUgZW5jb2RlZCBsZW5ndGggaXMgYXNzdW1lZCB0byBiZSBrZXB0IGF0IHRoZSBzdGFydCBvZiB0aGUgYnVmZmVyXG4gIC8vIGJ1dCBhbHNvIGFzc3VtZWQgdG8gYmUgaXJyZWxldmFudCBiZWNhdXNlIHRoZSByZXN0IG9mIHRoZSBzbGljZSBsZW5ndGhcbiAgLy8gYWN0dWFsbHkgYWxyZWFkeSBtYXRjaGVzIF9kZWNvZGVkX2xlbmd0aFxuICByZXR1cm4gZmx5d2VpZ2h0TWltZUJ1ZmZlci50b1N0cmluZygnYXNjaWknLCAxKTtcbn1cblxuZnVuY3Rpb24gZW5jb2RlQ3VzdG9tTWV0YWRhdGFIZWFkZXIoY3VzdG9tTWltZSwgbWV0YWRhdGFMZW5ndGgpIHtcbiAgY29uc3QgbWV0YWRhdGFIZWFkZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIDQgKyBjdXN0b21NaW1lLmxlbmd0aFxuICApO1xuICAvLyByZXNlcnZlIDEgYnl0ZSBmb3IgdGhlIGN1c3RvbU1pbWUgbGVuZ3RoXG4gIC8vIC8hXFwgY2FyZWZ1bCBub3QgdG8gcmVhZCB0aGF0IGZpcnN0IGJ5dGUsIHdoaWNoIGlzIHJhbmRvbSBhdCB0aGlzIHBvaW50XG4gIC8vIGludCB3cml0ZXJJbmRleEluaXRpYWwgPSBtZXRhZGF0YUhlYWRlci53cml0ZXJJbmRleCgpO1xuICAvLyBtZXRhZGF0YUhlYWRlci53cml0ZXJJbmRleCh3cml0ZXJJbmRleEluaXRpYWwgKyAxKTtcblxuICAvLyB3cml0ZSB0aGUgY3VzdG9tIG1pbWUgaW4gVVRGOCBidXQgdmFsaWRhdGUgaXQgaXMgYWxsIEFTQ0lJLWNvbXBhdGlibGVcbiAgLy8gKHdoaWNoIHByb2R1Y2VzIHRoZSByaWdodCByZXN1bHQgc2luY2UgQVNDSUkgY2hhcnMgYXJlIHN0aWxsIGVuY29kZWQgb24gMSBieXRlIGluIFVURjgpXG4gIGNvbnN0IGN1c3RvbU1pbWVMZW5ndGggPSBtZXRhZGF0YUhlYWRlci53cml0ZShjdXN0b21NaW1lLCAxKTtcbiAgaWYgKCFpc0FzY2lpKG1ldGFkYXRhSGVhZGVyLCAxKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ3VzdG9tIG1pbWUgdHlwZSBtdXN0IGJlIFVTX0FTQ0lJIGNoYXJhY3RlcnMgb25seScpO1xuICB9XG4gIGlmIChjdXN0b21NaW1lTGVuZ3RoIDwgMSB8fCBjdXN0b21NaW1lTGVuZ3RoID4gMTI4KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0N1c3RvbSBtaW1lIHR5cGUgbXVzdCBoYXZlIGEgc3RyaWN0bHkgcG9zaXRpdmUgbGVuZ3RoIHRoYXQgZml0cyBvbiA3IHVuc2lnbmVkIGJpdHMsIGllIDEtMTI4J1xuICAgICk7XG4gIH1cbiAgLy8gZW5jb2RlZCBsZW5ndGggaXMgb25lIGxlc3MgdGhhbiBhY3R1YWwgbGVuZ3RoLCBzaW5jZSAwIGlzIG5ldmVyIGEgdmFsaWQgbGVuZ3RoLCB3aGljaCBnaXZlc1xuICAvLyB3aWRlciByZXByZXNlbnRhdGlvbiByYW5nZVxuICBtZXRhZGF0YUhlYWRlci53cml0ZVVJbnQ4KGN1c3RvbU1pbWVMZW5ndGggLSAxKTtcblxuICAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQyNEJFKShcbiAgICBtZXRhZGF0YUhlYWRlcixcbiAgICBtZXRhZGF0YUxlbmd0aCxcbiAgICBjdXN0b21NaW1lTGVuZ3RoICsgMVxuICApO1xuXG4gIHJldHVybiBtZXRhZGF0YUhlYWRlcjtcbn1cblxuLyoqXG4gKiBFbmNvZGUgYSB7QGxpbmsgV2VsbEtub3duTWltZVR5cGUgd2VsbCBrbm93biBtaW1lIHR5cGV9IGFuZCBhIG1ldGFkYXRhIHZhbHVlIGxlbmd0aCBpbnRvIGFcbiAqIG5ld2x5IGFsbG9jYXRlZCB7QGxpbmsgQnl0ZUJ1Zn0uXG4gKlxuICogPHA+VGhpcyBjb21wYWN0IHJlcHJlc2VudGF0aW9uIGVuY29kZXMgdGhlIG1pbWUgdHlwZSB2aWEgaXRzIElEIG9uIGEgc2luZ2xlIGJ5dGUsIGFuZCB0aGVcbiAqIHVuc2lnbmVkIHZhbHVlIGxlbmd0aCBvbiAzIGFkZGl0aW9uYWwgYnl0ZXMuXG4gKlxuICogQHBhcmFtIGFsbG9jYXRvciB0aGUge0BsaW5rIEJ5dGVCdWZBbGxvY2F0b3J9IHRvIHVzZSB0byBjcmVhdGUgdGhlIGJ1ZmZlci5cbiAqIEBwYXJhbSBtaW1lVHlwZSBhIGJ5dGUgaWRlbnRpZmllciBvZiBhIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0gdG8gZW5jb2RlLlxuICogQHBhcmFtIG1ldGFkYXRhTGVuZ3RoIHRoZSBtZXRhZGF0YSBsZW5ndGggdG8gYXBwZW5kIHRvIHRoZSBidWZmZXIgYXMgYW4gdW5zaWduZWQgMjQgYml0c1xuICogICAgIGludGVnZXIuXG4gKiBAcmV0dXJuIHRoZSBlbmNvZGVkIG1pbWUgYW5kIG1ldGFkYXRhIGxlbmd0aCBpbmZvcm1hdGlvblxuICovXG5mdW5jdGlvbiBlbmNvZGVXZWxsS25vd25NZXRhZGF0YUhlYWRlcihtaW1lVHlwZSwgbWV0YWRhdGFMZW5ndGgpIHtcbiAgY29uc3QgYnVmZmVyID0gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5hbGxvYyg0KTtcblxuICBidWZmZXIud3JpdGVVSW50OChtaW1lVHlwZSB8IFNUUkVBTV9NRVRBREFUQV9LTk9XTl9NQVNLKTtcbiAgKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMud3JpdGVVSW50MjRCRSkoYnVmZmVyLCBtZXRhZGF0YUxlbmd0aCwgMSk7XG5cbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuLyoqXG4gKiBEZWNvZGUgZ2l2ZW4ge0BsaW5rIEJ1ZmZlcn0gaW50byB7QGxpbmsgSXRlcmF0b3I8RW50cnk+fVxuICpcbiAqIEBwYXJhbSBidWZmZXIgZW5jb2RlZCBDb21wb3NpdGUgTWV0YWRhdGEgY29udGVudFxuICogQHJldHVybnMge0l0ZXJhdG9yPEVudHJ5Pn1cbiAqIEBzaW5jZSAwLjAuMjFcbiAqL1xuZnVuY3Rpb24qIGRlY29kZUNvbXBvc2l0ZU1ldGFkYXRhKGJ1ZmZlcikge1xuICBjb25zdCBsZW5ndGggPSBidWZmZXIuYnl0ZUxlbmd0aDtcbiAgbGV0IGVudHJ5SW5kZXggPSAwO1xuXG4gIHdoaWxlIChlbnRyeUluZGV4IDwgbGVuZ3RoKSB7XG4gICAgY29uc3QgaGVhZGVyQW5kRGF0YSA9IGRlY29kZU1pbWVBbmRDb250ZW50QnVmZmVyc1NsaWNlcyhidWZmZXIsIGVudHJ5SW5kZXgpO1xuXG4gICAgY29uc3QgaGVhZGVyID0gaGVhZGVyQW5kRGF0YVswXTtcbiAgICBjb25zdCBkYXRhID0gaGVhZGVyQW5kRGF0YVsxXTtcblxuICAgIGVudHJ5SW5kZXggPSBjb21wdXRlTmV4dEVudHJ5SW5kZXgoZW50cnlJbmRleCwgaGVhZGVyLCBkYXRhKTtcblxuICAgIGlmICghaXNXZWxsS25vd25NaW1lVHlwZShoZWFkZXIpKSB7XG4gICAgICBjb25zdCB0eXBlU3RyaW5nID0gZGVjb2RlTWltZVR5cGVGcm9tTWltZUJ1ZmZlcihoZWFkZXIpO1xuICAgICAgaWYgKCF0eXBlU3RyaW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTUlNRSB0eXBlIGNhbm5vdCBiZSBudWxsJyk7XG4gICAgICB9XG5cbiAgICAgIHlpZWxkIG5ldyBFeHBsaWNpdE1pbWVUaW1lRW50cnkoZGF0YSwgdHlwZVN0cmluZyk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCBpZCA9IGRlY29kZU1pbWVJZEZyb21NaW1lQnVmZmVyKGhlYWRlcik7XG4gICAgY29uc3QgdHlwZSA9IF9XZWxsS25vd25NaW1lVHlwZS5kZWZhdWx0LmZyb21JZGVudGlmaWVyKGlkKTtcbiAgICBpZiAoX1dlbGxLbm93bk1pbWVUeXBlLlVOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFID09PSB0eXBlKSB7XG4gICAgICB5aWVsZCBuZXcgUmVzZXJ2ZWRNaW1lVHlwZUVudHJ5KGRhdGEsIGlkKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHlpZWxkIG5ldyBXZWxsS25vd25NaW1lVHlwZUVudHJ5KGRhdGEsIHR5cGUpO1xuICB9XG59XG5cbmNsYXNzIEV4cGxpY2l0TWltZVRpbWVFbnRyeSB7XG4gIGNvbnN0cnVjdG9yKGNvbnRlbnQsIHR5cGUpIHtcbiAgICB0aGlzLl9jb250ZW50ID0gY29udGVudDtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgfVxuXG4gIGdldCBjb250ZW50KCkge1xuICAgIHJldHVybiB0aGlzLl9jb250ZW50O1xuICB9XG5cbiAgZ2V0IG1pbWVUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLl90eXBlO1xuICB9XG59XG5leHBvcnRzLkV4cGxpY2l0TWltZVRpbWVFbnRyeSA9IEV4cGxpY2l0TWltZVRpbWVFbnRyeTtcblxuY2xhc3MgUmVzZXJ2ZWRNaW1lVHlwZUVudHJ5IHtcbiAgY29uc3RydWN0b3IoY29udGVudCwgdHlwZSkge1xuICAgIHRoaXMuX2NvbnRlbnQgPSBjb250ZW50O1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZ2V0IGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7XG4gIH1cblxuICAvKipcbiAgICoge0Bpbmhlcml0RG9jfSBTaW5jZSB0aGlzIGVudHJ5IHJlcHJlc2VudHMgYSBjb21wcmVzc2VkIGlkIHRoYXQgY291bGRuJ3QgYmUgZGVjb2RlZCwgdGhpcyBpc1xuICAgKiBhbHdheXMge0Bjb2RlIG51bGx9LlxuICAgKi9cbiAgZ2V0IG1pbWVUeXBlKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcmVzZXJ2ZWQsIGJ1dCB1bmtub3duIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0gZm9yIHRoaXMgZW50cnkuIFJhbmdlIGlzIDAtMTI3XG4gICAqIChpbmNsdXNpdmUpLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXNlcnZlZCwgYnV0IHVua25vd24ge0BsaW5rIFdlbGxLbm93bk1pbWVUeXBlfSBmb3IgdGhpcyBlbnRyeVxuICAgKi9cbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gIH1cbn1cbmV4cG9ydHMuUmVzZXJ2ZWRNaW1lVHlwZUVudHJ5ID0gUmVzZXJ2ZWRNaW1lVHlwZUVudHJ5O1xuXG5jbGFzcyBXZWxsS25vd25NaW1lVHlwZUVudHJ5IHtcbiAgY29uc3RydWN0b3IoY29udGVudCwgdHlwZSkge1xuICAgIHRoaXMuX2NvbnRlbnQgPSBjb250ZW50O1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuICB9XG5cbiAgZ2V0IGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRlbnQ7XG4gIH1cblxuICBnZXQgbWltZVR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGUuc3RyaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0gZm9yIHRoaXMgZW50cnkuXG4gICAqXG4gICAqIEByZXR1cm4gdGhlIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0gZm9yIHRoaXMgZW50cnlcbiAgICovXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzLl90eXBlO1xuICB9XG59XG5cbi8qKlxuICogRGVjb2RlIGEge0Bjb2RlIGJ5dGV9IGNvbXByZXNzZWQgbWltZSBpZCBmcm9tIGEge0BsaW5rIEJ5dGVCdWZ9LCBhc3N1bWluZyBzYWlkIGJ1ZmZlciBwcm9wZXJseVxuICogY29udGFpbnMgc3VjaCBhbiBpZC5cbiAqXG4gKiA8cD5UaGUgYnVmZmVyIG11c3QgaGF2ZSBleGFjdGx5IG9uZSByZWFkYWJsZSBieXRlLCB3aGljaCBpcyBhc3N1bWVkIHRvIGhhdmUgYmVlbiB0ZXN0ZWQgZm9yXG4gKiBtaW1lIGlkIGVuY29kaW5nIHZpYSB0aGUge0BsaW5rICNTVFJFQU1fTUVUQURBVEFfS05PV05fTUFTS30gbWFzayAoe0Bjb2RlIGZpcnN0Qnl0ZSAmXG4gKiBTVFJFQU1fTUVUQURBVEFfS05PV05fTUFTSykgPT0gU1RSRUFNX01FVEFEQVRBX0tOT1dOX01BU0t9KS5cbiAqXG4gKiA8cD5JZiB0aGVyZSBpcyBubyByZWFkYWJsZSBieXRlLCB0aGUgbmVnYXRpdmUgaWRlbnRpZmllciBvZiB7QGxpbmtcbiAqIFdlbGxLbm93bk1pbWVUeXBlI1VOUEFSU0VBQkxFX01JTUVfVFlQRX0gaXMgcmV0dXJuZWQuXG4gKlxuICogQHBhcmFtIG1pbWVCdWZmZXIgdGhlIGJ1ZmZlciB0aGF0IHNob3VsZCBuZXh0IGNvbnRhaW4gdGhlIGNvbXByZXNzZWQgbWltZSBpZCBieXRlXG4gKiBAcmV0dXJuIHRoZSBjb21wcmVzc2VkIG1pbWUgaWQsIGJldHdlZW4gMCBhbmQgMTI3LCBvciBhIG5lZ2F0aXZlIGlkIGlmIHRoZSBpbnB1dCBpcyBpbnZhbGlkXG4gKiBAc2VlICNkZWNvZGVNaW1lVHlwZUZyb21NaW1lQnVmZmVyKEJ5dGVCdWYpXG4gKi8gZXhwb3J0cy5XZWxsS25vd25NaW1lVHlwZUVudHJ5ID0gV2VsbEtub3duTWltZVR5cGVFbnRyeTtcbmZ1bmN0aW9uIGRlY29kZU1pbWVJZEZyb21NaW1lQnVmZmVyKG1pbWVCdWZmZXIpIHtcbiAgaWYgKCFpc1dlbGxLbm93bk1pbWVUeXBlKG1pbWVCdWZmZXIpKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5VTlBBUlNFQUJMRV9NSU1FX1RZUEUuaWRlbnRpZmllcjtcbiAgfVxuICByZXR1cm4gbWltZUJ1ZmZlci5yZWFkSW50OCgpICYgU1RSRUFNX01FVEFEQVRBX0xFTkdUSF9NQVNLO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlTmV4dEVudHJ5SW5kZXgoY3VycmVudEVudHJ5SW5kZXgsIGhlYWRlclNsaWNlLCBjb250ZW50U2xpY2UpIHtcbiAgcmV0dXJuIChcbiAgICBjdXJyZW50RW50cnlJbmRleCArXG4gICAgaGVhZGVyU2xpY2UuYnl0ZUxlbmd0aCArIC8vIHRoaXMgaW5jbHVkZXMgdGhlIG1pbWUgbGVuZ3RoIGJ5dGVcbiAgICAzICsgLy8gMyBieXRlcyBvZiB0aGUgY29udGVudCBsZW5ndGgsIHdoaWNoIGFyZSBleGNsdWRlZCBmcm9tIHRoZSBzbGljZVxuICAgIGNvbnRlbnRTbGljZS5ieXRlTGVuZ3RoXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzV2VsbEtub3duTWltZVR5cGUoaGVhZGVyKSB7XG4gIHJldHVybiBoZWFkZXIuYnl0ZUxlbmd0aCA9PT0gMTtcbn1cblxuY29uc3QgU1RSRUFNX01FVEFEQVRBX0tOT1dOX01BU0sgPSAweDgwOyAvLyAxMDAwIDAwMDBcbmNvbnN0IFNUUkVBTV9NRVRBREFUQV9MRU5HVEhfTUFTSyA9IDB4N2Y7IC8vIDAxMTEgMTExMVxuXG5mdW5jdGlvbiBpc0FzY2lpKGJ1ZmZlciwgb2Zmc2V0KSB7XG4gIGxldCBpc0FzY2lpID0gdHJ1ZTtcbiAgZm9yIChsZXQgaSA9IG9mZnNldCwgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGJ1ZmZlcltpXSA+IDEyNykge1xuICAgICAgaXNBc2NpaSA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGlzQXNjaWk7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHMgdG8gcHJvdmlkZVxuICogaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZSBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnQgd2lsbFxuICogcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gaW52YXJpYW50KGNvbmRpdGlvbiwgZm9ybWF0LCAuLi5hcmdzKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgbGV0IGVycm9yO1xuXG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgJyArXG4gICAgICAgICAgJ2RldiBlbnZpcm9ubWVudCBmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihmb3JtYXQucmVwbGFjZSgvJXMvZywgKCkgPT4gU3RyaW5nKGFyZ3NbYXJnSW5kZXgrK10pKSk7XG4gICAgICBlcnJvci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gU2tpcCBpbnZhcmlhbnQncyBvd24gc3RhY2sgZnJhbWUuXG5cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludmFyaWFudDtcbiIsIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5MaXRlQnVmZmVyID0gZXhwb3J0cy5CdWZmZXIgPSB2b2lkIDA7XG5cbnZhciBfYnVmZmVyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCdidWZmZXInKSk7XG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge2RlZmF1bHQ6IG9ian07XG59XG5cbmNvbnN0IGhhc0dsb2JhbEJ1ZmZlciA9XG4gIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbC5oYXNPd25Qcm9wZXJ0eSgnQnVmZmVyJyk7XG5jb25zdCBoYXNCdWZmZXJNb2R1bGUgPSBfYnVmZmVyLmRlZmF1bHQuaGFzT3duUHJvcGVydHkoJ0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBub3RJbXBsZW1lbnRlZChtc2cpIHtcbiAgY29uc3QgbWVzc2FnZSA9IG1zZyA/IGBOb3QgaW1wbGVtZW50ZWQ6ICR7bXNnfWAgOiAnTm90IGltcGxlbWVudGVkJztcbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxuLy8gVGFrZW4gZnJvbTogaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvYmE2ODQ4MDViNmMwZWRlZDc2ZTVjZDg5ZWUwMDMyOGFjN2E1OTM2NS9saWIvaW50ZXJuYWwvdXRpbC5qcyNMMTI1XG4vLyBSZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIG1hdGNoLlxuLy8gTW92ZSB0aGUgXCJzbG93IGNhc2VzXCIgdG8gYSBzZXBhcmF0ZSBmdW5jdGlvbiB0byBtYWtlIHN1cmUgdGhpcyBmdW5jdGlvbiBnZXRzXG4vLyBpbmxpbmVkIHByb3Blcmx5LiBUaGF0IHByaW9yaXRpemVzIHRoZSBjb21tb24gY2FzZS5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUVuY29kaW5nKGVuYykge1xuICBpZiAoZW5jID09IG51bGwgfHwgZW5jID09PSAndXRmOCcgfHwgZW5jID09PSAndXRmLTgnKSB7XG4gICAgcmV0dXJuICd1dGY4JztcbiAgfVxuICByZXR1cm4gc2xvd0Nhc2VzKGVuYyk7XG59XG5cbmZ1bmN0aW9uIGlzSW5zdGFuY2Uob2JqLCB0eXBlKSB7XG4gIHJldHVybiAoXG4gICAgb2JqIGluc3RhbmNlb2YgdHlwZSB8fFxuICAgIChvYmogIT0gbnVsbCAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lICE9IG51bGwgJiZcbiAgICAgIG9iai5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWUpXG4gICk7XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9iYTY4NDgwNWI2YzBlZGVkNzZlNWNkODllZTAwMzI4YWM3YTU5MzY1L2xpYi9pbnRlcm5hbC91dGlsLmpzI0wxMzBcbmZ1bmN0aW9uIHNsb3dDYXNlcyhlbmMpIHtcbiAgc3dpdGNoIChlbmMubGVuZ3RoKSB7XG4gICAgY2FzZSA0OlxuICAgICAgaWYgKGVuYyA9PT0gJ1VURjgnKSB7XG4gICAgICAgIHJldHVybiAndXRmOCc7XG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAndWNzMicgfHwgZW5jID09PSAnVUNTMicpIHtcbiAgICAgICAgcmV0dXJuICd1dGYxNmxlJztcbiAgICAgIH1cbiAgICAgIGVuYyA9IGAke2VuY31gLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoZW5jID09PSAndXRmOCcpIHtcbiAgICAgICAgcmV0dXJuICd1dGY4JztcbiAgICAgIH1cbiAgICAgIGlmIChlbmMgPT09ICd1Y3MyJykge1xuICAgICAgICByZXR1cm4gJ3V0ZjE2bGUnO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgaWYgKGVuYyA9PT0gJ2hleCcgfHwgZW5jID09PSAnSEVYJyB8fCBgJHtlbmN9YC50b0xvd2VyQ2FzZSgpID09PSAnaGV4Jykge1xuICAgICAgICByZXR1cm4gJ2hleCc7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIDU6XG4gICAgICBpZiAoZW5jID09PSAnYXNjaWknKSB7XG4gICAgICAgIHJldHVybiAnYXNjaWknO1xuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ3Vjcy0yJykge1xuICAgICAgICByZXR1cm4gJ3V0ZjE2bGUnO1xuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ1VURi04Jykge1xuICAgICAgICByZXR1cm4gJ3V0ZjgnO1xuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ0FTQ0lJJykge1xuICAgICAgICByZXR1cm4gJ2FzY2lpJztcbiAgICAgIH1cbiAgICAgIGlmIChlbmMgPT09ICdVQ1MtMicpIHtcbiAgICAgICAgcmV0dXJuICd1dGYxNmxlJztcbiAgICAgIH1cbiAgICAgIGVuYyA9IGAke2VuY31gLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoZW5jID09PSAndXRmLTgnKSB7XG4gICAgICAgIHJldHVybiAndXRmOCc7XG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnYXNjaWknKSB7XG4gICAgICAgIHJldHVybiAnYXNjaWknO1xuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ3Vjcy0yJykge1xuICAgICAgICByZXR1cm4gJ3V0ZjE2bGUnO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSA2OlxuICAgICAgaWYgKGVuYyA9PT0gJ2Jhc2U2NCcpIHtcbiAgICAgICAgcmV0dXJuICdiYXNlNjQnO1xuICAgICAgfVxuICAgICAgaWYgKGVuYyA9PT0gJ2xhdGluMScgfHwgZW5jID09PSAnYmluYXJ5Jykge1xuICAgICAgICByZXR1cm4gJ2xhdGluMSc7XG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnQkFTRTY0Jykge1xuICAgICAgICByZXR1cm4gJ2Jhc2U2NCc7XG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnTEFUSU4xJyB8fCBlbmMgPT09ICdCSU5BUlknKSB7XG4gICAgICAgIHJldHVybiAnbGF0aW4xJztcbiAgICAgIH1cbiAgICAgIGVuYyA9IGAke2VuY31gLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoZW5jID09PSAnYmFzZTY0Jykge1xuICAgICAgICByZXR1cm4gJ2Jhc2U2NCc7XG4gICAgICB9XG4gICAgICBpZiAoZW5jID09PSAnbGF0aW4xJyB8fCBlbmMgPT09ICdiaW5hcnknKSB7XG4gICAgICAgIHJldHVybiAnbGF0aW4xJztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNzpcbiAgICAgIGlmIChcbiAgICAgICAgZW5jID09PSAndXRmMTZsZScgfHxcbiAgICAgICAgZW5jID09PSAnVVRGMTZMRScgfHxcbiAgICAgICAgYCR7ZW5jfWAudG9Mb3dlckNhc2UoKSA9PT0gJ3V0ZjE2bGUnXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuICd1dGYxNmxlJztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgODpcbiAgICAgIGlmIChcbiAgICAgICAgZW5jID09PSAndXRmLTE2bGUnIHx8XG4gICAgICAgIGVuYyA9PT0gJ1VURi0xNkxFJyB8fFxuICAgICAgICBgJHtlbmN9YC50b0xvd2VyQ2FzZSgpID09PSAndXRmLTE2bGUnXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuICd1dGYxNmxlJztcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoZW5jID09PSAnJykge1xuICAgICAgICByZXR1cm4gJ3V0ZjgnO1xuICAgICAgfVxuICB9XG59XG5cbmNvbnN0IG5vdEltcGxlbWVudGVkRW5jb2RpbmdzID0gW1xuICAnYmFzZTY0JyxcbiAgJ2hleCcsXG4gICdhc2NpaScsXG4gICdiaW5hcnknLFxuICAnbGF0aW4xJyxcbiAgJ3VjczInLFxuICAndXRmMTZsZScsXG5dO1xuXG5mdW5jdGlvbiBjaGVja0VuY29kaW5nKGVuY29kaW5nID0gJ3V0ZjgnLCBzdHJpY3QgPSB0cnVlKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IChzdHJpY3QgJiYgZW5jb2RpbmcgPT09ICcnKSkge1xuICAgIGlmICghc3RyaWN0KSB7XG4gICAgICByZXR1cm4gJ3V0ZjgnO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmtub3duIGVuY29kaW5nOiAke2VuY29kaW5nfWApO1xuICB9XG5cbiAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUVuY29kaW5nKGVuY29kaW5nKTtcblxuICBpZiAobm9ybWFsaXplZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5rbm93biBlbmNvZGluZzogJHtlbmNvZGluZ31gKTtcbiAgfVxuXG4gIGlmIChub3RJbXBsZW1lbnRlZEVuY29kaW5ncy5pbmNsdWRlcyhlbmNvZGluZykpIHtcbiAgICBub3RJbXBsZW1lbnRlZChgXCIke2VuY29kaW5nfVwiIGVuY29kaW5nYCk7XG4gIH1cblxuICByZXR1cm4gbm9ybWFsaXplZDtcbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvNTZkYmU0NjZmZGJjNTk4YmFlYTNiZmNlMjg5YmY1MmI5N2I4YjhmNy9saWIvYnVmZmVyLmpzI0w1OThcbmNvbnN0IGVuY29kaW5nT3BzID0ge1xuICBhc2NpaToge1xuICAgIGJ5dGVMZW5ndGg6IChzdHJpbmcpID0+IHN0cmluZy5sZW5ndGgsXG4gIH0sXG5cbiAgYmFzZTY0OiB7XG4gICAgYnl0ZUxlbmd0aDogKHN0cmluZykgPT4gYmFzZTY0Qnl0ZUxlbmd0aChzdHJpbmcsIHN0cmluZy5sZW5ndGgpLFxuICB9LFxuXG4gIGhleDoge1xuICAgIGJ5dGVMZW5ndGg6IChzdHJpbmcpID0+IHN0cmluZy5sZW5ndGggPj4+IDEsXG4gIH0sXG5cbiAgbGF0aW4xOiB7XG4gICAgYnl0ZUxlbmd0aDogKHN0cmluZykgPT4gc3RyaW5nLmxlbmd0aCxcbiAgfSxcblxuICB1Y3MyOiB7XG4gICAgYnl0ZUxlbmd0aDogKHN0cmluZykgPT4gc3RyaW5nLmxlbmd0aCAqIDIsXG4gIH0sXG5cbiAgdXRmMTZsZToge1xuICAgIGJ5dGVMZW5ndGg6IChzdHJpbmcpID0+IHN0cmluZy5sZW5ndGggKiAyLFxuICB9LFxuXG4gIHV0Zjg6IHtcbiAgICBieXRlTGVuZ3RoOiAoc3RyaW5nKSA9PiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCxcbiAgfSxcbn07XG5cbmZ1bmN0aW9uIGJhc2U2NEJ5dGVMZW5ndGgoc3RyLCBieXRlcykge1xuICAvLyBIYW5kbGUgcGFkZGluZ1xuICBpZiAoc3RyLmNoYXJDb2RlQXQoYnl0ZXMgLSAxKSA9PT0gMHgzZCkge1xuICAgIGJ5dGVzLS07XG4gIH1cbiAgaWYgKGJ5dGVzID4gMSAmJiBzdHIuY2hhckNvZGVBdChieXRlcyAtIDEpID09PSAweDNkKSB7XG4gICAgYnl0ZXMtLTtcbiAgfVxuXG4gIC8vIEJhc2U2NCByYXRpbzogMy80XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1iaXR3aXNlXG4gIHJldHVybiAoYnl0ZXMgKiAzKSA+Pj4gMjtcbn1cblxuY29uc3QgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDA7XG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkoY29kZVBvaW50cykge1xuICBjb25zdCBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aDtcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cyk7IC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgbGV0IHJlcyA9ICcnO1xuICBsZXQgaSA9IDA7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIChpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSlcbiAgICApO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0ciwgcFVuaXRzID0gSW5maW5pdHkpIHtcbiAgbGV0IHVuaXRzID0gcFVuaXRzO1xuICBsZXQgY29kZVBvaW50O1xuICBjb25zdCBsZW5ndGggPSBzdHIubGVuZ3RoO1xuICBsZXQgbGVhZFN1cnJvZ2F0ZSA9IG51bGw7XG4gIGNvbnN0IGJ5dGVzID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0ci5jaGFyQ29kZUF0KGkpO1xuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweGQ3ZmYgJiYgY29kZVBvaW50IDwgMHhlMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweGRiZmYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSB7XG4gICAgICAgICAgICBieXRlcy5wdXNoKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkge1xuICAgICAgICAgICAgYnl0ZXMucHVzaCgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnQ7XG5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweGRjMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSB7XG4gICAgICAgICAgYnl0ZXMucHVzaCgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgfVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9XG4gICAgICAgICgoKGxlYWRTdXJyb2dhdGUgLSAweGQ4MDApIDw8IDEwKSB8IChjb2RlUG9pbnQgLSAweGRjMDApKSArIDB4MTAwMDA7XG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIHtcbiAgICAgICAgYnl0ZXMucHVzaCgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbDtcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpO1xuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYnl0ZXMucHVzaCgoY29kZVBvaW50ID4+IDB4NikgfCAweGMwLCAoY29kZVBvaW50ICYgMHgzZikgfCAweDgwKTtcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgKGNvZGVQb2ludCA+PiAweGMpIHwgMHhlMCxcbiAgICAgICAgKChjb2RlUG9pbnQgPj4gMHg2KSAmIDB4M2YpIHwgMHg4MCxcbiAgICAgICAgKGNvZGVQb2ludCAmIDB4M2YpIHwgMHg4MFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIChjb2RlUG9pbnQgPj4gMHgxMikgfCAweGYwLFxuICAgICAgICAoKGNvZGVQb2ludCA+PiAweGMpICYgMHgzZikgfCAweDgwLFxuICAgICAgICAoKGNvZGVQb2ludCA+PiAweDYpICYgMHgzZikgfCAweDgwLFxuICAgICAgICAoY29kZVBvaW50ICYgMHgzZikgfCAweDgwXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlcztcbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpO1xuICBjb25zdCByZXMgPSBbXTtcblxuICBsZXQgaSA9IHN0YXJ0O1xuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIGNvbnN0IGZpcnN0Qnl0ZSA9IGJ1ZltpXTtcbiAgICBsZXQgY29kZVBvaW50ID0gbnVsbDtcbiAgICBsZXQgYnl0ZXNQZXJTZXF1ZW5jZSA9XG4gICAgICBmaXJzdEJ5dGUgPiAweGVmID8gNCA6IGZpcnN0Qnl0ZSA+IDB4ZGYgPyAzIDogZmlyc3RCeXRlID4gMHhiZiA/IDIgOiAxO1xuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgbGV0IHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludDtcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdO1xuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4YzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKChmaXJzdEJ5dGUgJiAweDFmKSA8PCAweDYpIHwgKHNlY29uZEJ5dGUgJiAweDNmKTtcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Zikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdO1xuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl07XG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhjMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4YzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID1cbiAgICAgICAgICAgICAgKChmaXJzdEJ5dGUgJiAweGYpIDw8IDB4YykgfFxuICAgICAgICAgICAgICAoKHNlY29uZEJ5dGUgJiAweDNmKSA8PCAweDYpIHxcbiAgICAgICAgICAgICAgKHRoaXJkQnl0ZSAmIDB4M2YpO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID4gMHg3ZmYgJiZcbiAgICAgICAgICAgICAgKHRlbXBDb2RlUG9pbnQgPCAweGQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4ZGZmZilcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdO1xuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl07XG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM107XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHNlY29uZEJ5dGUgJiAweGMwKSA9PT0gMHg4MCAmJlxuICAgICAgICAgICAgKHRoaXJkQnl0ZSAmIDB4YzApID09PSAweDgwICYmXG4gICAgICAgICAgICAoZm91cnRoQnl0ZSAmIDB4YzApID09PSAweDgwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID1cbiAgICAgICAgICAgICAgKChmaXJzdEJ5dGUgJiAweGYpIDw8IDB4MTIpIHxcbiAgICAgICAgICAgICAgKChzZWNvbmRCeXRlICYgMHgzZikgPDwgMHhjKSB8XG4gICAgICAgICAgICAgICgodGhpcmRCeXRlICYgMHgzZikgPDwgMHg2KSB8XG4gICAgICAgICAgICAgIChmb3VydGhCeXRlICYgMHgzZik7XG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4ZmZmZiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhmZmZkO1xuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDE7XG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweGZmZmYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgIHJlcy5wdXNoKCgoY29kZVBvaW50ID4+PiAxMCkgJiAweDNmZikgfCAweGQ4MDApO1xuICAgICAgY29kZVBvaW50ID0gMHhkYzAwIHwgKGNvZGVQb2ludCAmIDB4M2ZmKTtcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpO1xuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZTtcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKTtcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlKGJ1ZiwgaW5wdXQsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKFxuICAgIHV0ZjhUb0J5dGVzKGlucHV0LCBidWYubGVuZ3RoIC0gb2Zmc2V0KSxcbiAgICBidWYsXG4gICAgb2Zmc2V0LFxuICAgIGxlbmd0aFxuICApO1xufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBsZXQgaSA9IDA7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoIHx8IGkgPj0gc3JjLmxlbmd0aCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXTtcbiAgfVxuICByZXR1cm4gaTtcbn1cblxuLyoqXG4gKiBTZWUgYWxzbyBodHRwczovL25vZGVqcy5vcmcvYXBpL2J1ZmZlci5odG1sXG4gKi9cbmNsYXNzIEJ1ZmZlciBleHRlbmRzIFVpbnQ4QXJyYXkge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgICAgc3VwZXIodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBvZmZzZXQgPSBieXRlT2Zmc2V0IHx8IDA7XG4gICAgICBjb25zdCByZWFsTGVuZ3RoID1cbiAgICAgICAgLy8kRmxvd0ZpeE1lXG4gICAgICAgIGxlbmd0aCB8fCAoaXNJbnN0YW5jZSh2YWx1ZSwgQXJyYXkpID8gdmFsdWUubGVuZ3RoIDogdmFsdWUuYnl0ZUxlbmd0aCk7XG4gICAgICBzdXBlcih2YWx1ZSwgb2Zmc2V0LCByZWFsTGVuZ3RoKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFsbG9jYXRlcyBhIG5ldyBCdWZmZXIgb2Ygc2l6ZSBieXRlcy5cbiAgICovXG4gIHN0YXRpYyBhbGxvYyhzaXplLCBmaWxsID0gMCwgZW5jb2RpbmcgPSAndXRmOCcpIHtcbiAgICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgVGhlIFwic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBudW1iZXIuIFJlY2VpdmVkIHR5cGUgJHt0eXBlb2Ygc2l6ZX1gXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1ZiA9IG5ldyBCdWZmZXIoc2l6ZSk7XG4gICAgaWYgKHNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBidWY7XG4gICAgfVxuXG4gICAgbGV0IGJ1ZkZpbGw7XG4gICAgaWYgKHR5cGVvZiBmaWxsID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBjaGVja0VuY29kaW5nKGVuY29kaW5nKTtcbiAgICAgIGlmIChmaWxsLmxlbmd0aCA9PT0gMSAmJiBlbmNvZGluZyA9PT0gJ3V0ZjgnKSB7XG4gICAgICAgIGJ1Zi5maWxsKGZpbGwuY2hhckNvZGVBdCgwKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZGaWxsID0gQnVmZmVyLmZyb20oZmlsbCwgZW5jb2RpbmcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbGwgPT09ICdudW1iZXInKSB7XG4gICAgICBidWYuZmlsbChmaWxsKTtcbiAgICB9IGVsc2UgaWYgKGlzSW5zdGFuY2UoZmlsbCwgVWludDhBcnJheSkpIHtcbiAgICAgIGlmIChmaWxsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIGBUaGUgYXJndW1lbnQgXCJ2YWx1ZVwiIGlzIGludmFsaWQuIFJlY2VpdmVkICR7ZmlsbC5jb25zdHJ1Y3Rvci5uYW1lfSBbXWBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgYnVmRmlsbCA9IGZpbGw7XG4gICAgfVxuXG4gICAgaWYgKGJ1ZkZpbGwpIHtcbiAgICAgIGlmIChidWZGaWxsLmxlbmd0aCA+IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgYnVmRmlsbCA9IGJ1ZkZpbGwuc3ViYXJyYXkoMCwgYnVmLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBvZmZzZXQgPSAwO1xuICAgICAgd2hpbGUgKG9mZnNldCA8IHNpemUpIHtcbiAgICAgICAgYnVmLnNldChidWZGaWxsLCBvZmZzZXQpO1xuICAgICAgICBvZmZzZXQgKz0gYnVmRmlsbC5sZW5ndGg7XG4gICAgICAgIGlmIChvZmZzZXQgKyBidWZGaWxsLmxlbmd0aCA+PSBzaXplKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChvZmZzZXQgIT09IHNpemUpIHtcbiAgICAgICAgYnVmLnNldChidWZGaWxsLnN1YmFycmF5KDAsIHNpemUgLSBvZmZzZXQpLCBvZmZzZXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICBzdGF0aWMgYWxsb2NVbnNhZmUoc2l6ZSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKHNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ5dGUgbGVuZ3RoIG9mIGEgc3RyaW5nIHdoZW4gZW5jb2RlZC4gVGhpcyBpcyBub3QgdGhlIHNhbWUgYXNcbiAgICogU3RyaW5nLnByb3RvdHlwZS5sZW5ndGgsIHdoaWNoIGRvZXMgbm90IGFjY291bnQgZm9yIHRoZSBlbmNvZGluZyB0aGF0IGlzXG4gICAqIHVzZWQgdG8gY29udmVydCB0aGUgc3RyaW5nIGludG8gYnl0ZXMuXG4gICAqL1xuICBzdGF0aWMgYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gICAgaWYgKHR5cGVvZiBzdHJpbmcgIT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aDtcbiAgICB9XG5cbiAgICBlbmNvZGluZyA9IG5vcm1hbGl6ZUVuY29kaW5nKGVuY29kaW5nKSB8fCAndXRmOCc7XG4gICAgcmV0dXJuIGVuY29kaW5nT3BzW2VuY29kaW5nXS5ieXRlTGVuZ3RoKHN0cmluZyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBCdWZmZXIgd2hpY2ggaXMgdGhlIHJlc3VsdCBvZiBjb25jYXRlbmF0aW5nIGFsbCB0aGUgQnVmZmVyXG4gICAqIGluc3RhbmNlcyBpbiB0aGUgbGlzdCB0b2dldGhlci5cbiAgICovXG4gIHN0YXRpYyBjb25jYXQobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgICBpZiAodG90YWxMZW5ndGggPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0b3RhbExlbmd0aCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGJ1ZiBvZiBsaXN0KSB7XG4gICAgICAgIHRvdGFsTGVuZ3RoICs9IGJ1Zi5sZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aCk7XG4gICAgbGV0IHBvcyA9IDA7XG4gICAgZm9yIChjb25zdCBidWYgb2YgbGlzdCkge1xuICAgICAgYnVmZmVyLnNldChidWYsIHBvcyk7XG4gICAgICBwb3MgKz0gYnVmLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY3JlYXRlcyBhIHZpZXcgb2YgdGhlIEFycmF5QnVmZmVyIHdpdGhvdXQgY29weWluZyB0aGUgdW5kZXJseWluZ1xuICAgKiBtZW1vcnkuIEZvciBleGFtcGxlLCB3aGVuIHBhc3NlZCBhIHJlZmVyZW5jZSB0byB0aGUgLmJ1ZmZlciBwcm9wZXJ0eSBvZiBhXG4gICAqIFR5cGVkQXJyYXkgaW5zdGFuY2UsIHRoZSBuZXdseSBjcmVhdGVkIEJ1ZmZlciB3aWxsIHNoYXJlIHRoZSBzYW1lIGFsbG9jYXRlZFxuICAgKiBtZW1vcnkgYXMgdGhlIFR5cGVkQXJyYXkuXG4gICAqL1xuICAvLyRGbG93Rml4TWVcbiAgc3RhdGljIGZyb20oXG4gICAgdmFsdWUsXG4gICAgYnl0ZU9mZnNldE9yRW5jb2RpbmcsXG4gICAgLy8kRmxvd0ZpeE1lXG4gICAgbGVuZ3RoXG4gICkge1xuICAgIGNvbnN0IG9mZnNldCA9XG4gICAgICB0eXBlb2YgYnl0ZU9mZnNldE9yRW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogYnl0ZU9mZnNldE9yRW5jb2Rpbmc7XG4gICAgbGV0IGVuY29kaW5nID1cbiAgICAgIHR5cGVvZiBieXRlT2Zmc2V0T3JFbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBieXRlT2Zmc2V0T3JFbmNvZGluZ1xuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdTdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICBlbmNvZGluZyA9IGNoZWNrRW5jb2RpbmcoZW5jb2RpbmcsIGZhbHNlKTtcbiAgICAgIC8vIGlmIChlbmNvZGluZyA9PT0gJ2hleCcpIHtyZXR1cm4gbmV3IEJ1ZmZlcihoZXguZGVjb2RlU3RyaW5nKHZhbHVlKS5idWZmZXIpO31cbiAgICAgIC8vIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcpIHtyZXR1cm4gbmV3IEJ1ZmZlcihiYXNlNjQuZGVjb2RlKHZhbHVlKSk7fVxuXG4gICAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgICAgIGlmICh0eXBlb2YgVGV4dEVuY29kZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEJ1ZmZlcihuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUodmFsdWUpLmJ1ZmZlcik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgQnVmZmVyKHV0ZjhUb0J5dGVzKHZhbHVlKSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM4NDQ2XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIodmFsdWUsIG9mZnNldCwgbGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgb2JqIGlzIGEgQnVmZmVyLCBmYWxzZSBvdGhlcndpc2UuXG4gICAqL1xuICBzdGF0aWMgaXNCdWZmZXIob2JqKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGlzSW5zdGFuY2Uob2JqLCBCdWZmZXIpIHx8XG4gICAgICAoIWhhc0dsb2JhbEJ1ZmZlciAmJiBoYXNCdWZmZXJNb2R1bGUgJiYgaXNJbnN0YW5jZShvYmosIFVpbnQ4QXJyYXkpKVxuICAgICk7XG4gIH1cblxuICBzdGF0aWMgaXNFbmNvZGluZyhlbmNvZGluZykge1xuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmXG4gICAgICBlbmNvZGluZy5sZW5ndGggIT09IDAgJiZcbiAgICAgIG5vcm1hbGl6ZUVuY29kaW5nKGVuY29kaW5nKSAhPT0gdW5kZWZpbmVkXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgZGF0YSBmcm9tIGEgcmVnaW9uIG9mIGJ1ZiB0byBhIHJlZ2lvbiBpbiB0YXJnZXQsIGV2ZW4gaWYgdGhlIHRhcmdldFxuICAgKiBtZW1vcnkgcmVnaW9uIG92ZXJsYXBzIHdpdGggYnVmLlxuICAgKi9cbiAgY29weShcbiAgICB0YXJnZXRCdWZmZXIsXG4gICAgdGFyZ2V0U3RhcnQgPSAwLFxuICAgIHNvdXJjZVN0YXJ0ID0gMCxcbiAgICBzb3VyY2VFbmQgPSB0aGlzLmxlbmd0aFxuICApIHtcbiAgICBjb25zdCBzb3VyY2VCdWZmZXIgPSB0aGlzLnN1YmFycmF5KHNvdXJjZVN0YXJ0LCBzb3VyY2VFbmQpO1xuICAgIHRhcmdldEJ1ZmZlci5zZXQoc291cmNlQnVmZmVyLCB0YXJnZXRTdGFydCk7XG4gICAgcmV0dXJuIHNvdXJjZUJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgYm90aCBidWYgYW5kIG90aGVyQnVmZmVyIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBieXRlcywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKi9cbiAgZXF1YWxzKG90aGVyQnVmZmVyKSB7XG4gICAgaWYgKCFpc0luc3RhbmNlKG90aGVyQnVmZmVyLCBVaW50OEFycmF5KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cbiAgICAgICAgYFRoZSBcIm90aGVyQnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBCdWZmZXIgb3IgVWludDhBcnJheS4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBvdGhlckJ1ZmZlcn1gXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzID09PSBvdGhlckJ1ZmZlcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLmJ5dGVMZW5ndGggIT09IG90aGVyQnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzW2ldICE9PSBvdGhlckJ1ZmZlcltpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZWFkRG91YmxlQkUob2Zmc2V0ID0gMCkge1xuICAgIHJldHVybiBuZXcgRGF0YVZpZXcoXG4gICAgICB0aGlzLmJ1ZmZlcixcbiAgICAgIHRoaXMuYnl0ZU9mZnNldCxcbiAgICAgIHRoaXMuYnl0ZUxlbmd0aFxuICAgICkuZ2V0RmxvYXQ2NChvZmZzZXQpO1xuICB9XG5cbiAgcmVhZERvdWJsZUxFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldEZsb2F0NjQob2Zmc2V0LCB0cnVlKTtcbiAgfVxuXG4gIHJlYWRGbG9hdEJFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldEZsb2F0MzIob2Zmc2V0KTtcbiAgfVxuXG4gIHJlYWRGbG9hdExFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldEZsb2F0MzIob2Zmc2V0LCB0cnVlKTtcbiAgfVxuXG4gIHJlYWRJbnQ4KG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuZ2V0SW50OChcbiAgICAgIG9mZnNldFxuICAgICk7XG4gIH1cblxuICByZWFkSW50MTZCRShvZmZzZXQgPSAwKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLmdldEludDE2KFxuICAgICAgb2Zmc2V0XG4gICAgKTtcbiAgfVxuXG4gIHJlYWRJbnQxNkxFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuZ2V0SW50MTYoXG4gICAgICBvZmZzZXQsXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIHJlYWRJbnQzMkJFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuZ2V0SW50MzIoXG4gICAgICBvZmZzZXRcbiAgICApO1xuICB9XG5cbiAgcmVhZEludDMyTEUob2Zmc2V0ID0gMCkge1xuICAgIHJldHVybiBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5ieXRlTGVuZ3RoKS5nZXRJbnQzMihcbiAgICAgIG9mZnNldCxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgcmVhZFVJbnQ4KG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuZ2V0VWludDgoXG4gICAgICBvZmZzZXRcbiAgICApO1xuICB9XG5cbiAgcmVhZFVJbnQxNkJFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldFVpbnQxNihvZmZzZXQpO1xuICB9XG5cbiAgcmVhZFVJbnQxNkxFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldFVpbnQxNihvZmZzZXQsIHRydWUpO1xuICB9XG5cbiAgcmVhZFVJbnQzMkJFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldFVpbnQzMihvZmZzZXQpO1xuICB9XG5cbiAgcmVhZFVJbnQzMkxFKG9mZnNldCA9IDApIHtcbiAgICByZXR1cm4gbmV3IERhdGFWaWV3KFxuICAgICAgdGhpcy5idWZmZXIsXG4gICAgICB0aGlzLmJ5dGVPZmZzZXQsXG4gICAgICB0aGlzLmJ5dGVMZW5ndGhcbiAgICApLmdldFVpbnQzMihvZmZzZXQsIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgQnVmZmVyIHRoYXQgcmVmZXJlbmNlcyB0aGUgc2FtZSBtZW1vcnkgYXMgdGhlIG9yaWdpbmFsLCBidXRcbiAgICogb2Zmc2V0IGFuZCBjcm9wcGVkIGJ5IHRoZSBzdGFydCBhbmQgZW5kIGluZGljZXMuXG4gICAqL1xuICAvLyAkRmxvd0ZpeE1lXG4gIHNsaWNlKGJlZ2luID0gMCwgZW5kID0gdGhpcy5sZW5ndGgpIHtcbiAgICAvLyB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM4NjY1XG4gICAgcmV0dXJuIHRoaXMuc3ViYXJyYXkoYmVnaW4sIGVuZCk7XG4gIH1cblxuICAvLyAkRmxvd0ZpeE1lXG4gIHN1YmFycmF5KGJlZ2luID0gMCwgZW5kID0gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdXBlci5zdWJhcnJheShiZWdpbiwgZW5kKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgYnVmLiBKU09OLnN0cmluZ2lmeSgpIGltcGxpY2l0bHkgY2FsbHNcbiAgICogdGhpcyBmdW5jdGlvbiB3aGVuIHN0cmluZ2lmeWluZyBhIEJ1ZmZlciBpbnN0YW5jZS5cbiAgICovXG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge2RhdGE6IEFycmF5LmZyb20odGhpcyksIHR5cGU6ICdCdWZmZXInfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvZGVzIGJ1ZiB0byBhIHN0cmluZyBhY2NvcmRpbmcgdG8gdGhlIHNwZWNpZmllZCBjaGFyYWN0ZXIgZW5jb2RpbmcgaW5cbiAgICogZW5jb2RpbmcuIHN0YXJ0IGFuZCBlbmQgbWF5IGJlIHBhc3NlZCB0byBkZWNvZGUgb25seSBhIHN1YnNldCBvZiBidWYuXG4gICAqL1xuICB0b1N0cmluZyhlbmNvZGluZyA9ICd1dGY4Jywgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aCkge1xuICAgIGVuY29kaW5nID0gY2hlY2tFbmNvZGluZyhlbmNvZGluZyk7XG5cbiAgICBpZiAodHlwZW9mIFRleHREZWNvZGVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgYiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCk7XG4gICAgICAvLyBpZiAoZW5jb2RpbmcgPT09ICdoZXgnKSB7cmV0dXJuIGhleC5lbmNvZGVUb1N0cmluZyhiKTt9XG4gICAgICAvLyBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnKSB7cmV0dXJuIGJhc2U2NC5lbmNvZGUoYi5idWZmZXIpO31cblxuICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zbG93VG9TdHJpbmcoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpO1xuICB9XG5cbiAgc2xvd1RvU3RyaW5nKGVuY29kaW5nID0gJ3V0ZjgnLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKSB7XG4gICAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChlbmQgPD0gMCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gICAgZW5kID4+Pj0gMDtcbiAgICBzdGFydCA+Pj49IDA7XG5cbiAgICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgZW5jb2RpbmcgPSBjaGVja0VuY29kaW5nKGVuY29kaW5nKTtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vuc3VwcG9ydGVkIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZXMgc3RyaW5nIHRvIGJ1ZiBhdCBvZmZzZXQgYWNjb3JkaW5nIHRvIHRoZSBjaGFyYWN0ZXIgZW5jb2RpbmcgaW5cbiAgICogZW5jb2RpbmcuIFRoZSBsZW5ndGggcGFyYW1ldGVyIGlzIHRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gd3JpdGUuIElmIGJ1ZiBkaWRcbiAgICogbm90IGNvbnRhaW4gZW5vdWdoIHNwYWNlIHRvIGZpdCB0aGUgZW50aXJlIHN0cmluZywgb25seSBwYXJ0IG9mIHN0cmluZyB3aWxsXG4gICAqIGJlIHdyaXR0ZW4uIEhvd2V2ZXIsIHBhcnRpYWxseSBlbmNvZGVkIGNoYXJhY3RlcnMgd2lsbCBub3QgYmUgd3JpdHRlbi5cbiAgICovXG4gIHdyaXRlKHN0cmluZywgb2Zmc2V0ID0gMCwgbGVuZ3RoID0gdGhpcy5sZW5ndGgsIGVuY29kaW5nID0gJ3V0ZjgnKSB7XG4gICAgZW5jb2RpbmcgPSBjaGVja0VuY29kaW5nKGVuY29kaW5nKTtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgICAgaWYgKHR5cGVvZiBUZXh0RW5jb2RlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICAgICAgY29uc3QgcmVzdWx0QXJyYXkgPSBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUoc3RyaW5nKTtcbiAgICAgICAgICB0aGlzLnNldChyZXN1bHRBcnJheSwgb2Zmc2V0KTtcblxuICAgICAgICAgIHJldHVybiByZXN1bHRBcnJheS5ieXRlTGVuZ3RoID4gbGVuZ3RoIC0gb2Zmc2V0XG4gICAgICAgICAgICA/IGxlbmd0aCAtIG9mZnNldFxuICAgICAgICAgICAgOiByZXN1bHRBcnJheS5ieXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpO1xuICAgIH1cbiAgfVxuXG4gIHdyaXRlRG91YmxlQkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5ieXRlTGVuZ3RoKS5zZXRGbG9hdDY0KFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDg7XG4gIH1cblxuICB3cml0ZURvdWJsZUxFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuc2V0RmxvYXQ2NChcbiAgICAgIG9mZnNldCxcbiAgICAgIHZhbHVlLFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgODtcbiAgfVxuXG4gIHdyaXRlRmxvYXRCRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldEZsb2F0MzIoXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWx1ZVxuICAgICk7XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgNDtcbiAgfVxuXG4gIHdyaXRlRmxvYXRMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldEZsb2F0MzIoXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWx1ZSxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDQ7XG4gIH1cblxuICB3cml0ZUludDgodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5ieXRlTGVuZ3RoKS5zZXRJbnQ4KFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDE7XG4gIH1cblxuICB3cml0ZUludDE2QkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5ieXRlTGVuZ3RoKS5zZXRJbnQxNihcbiAgICAgIG9mZnNldCxcbiAgICAgIHZhbHVlXG4gICAgKTtcblxuICAgIHJldHVybiBvZmZzZXQgKyAyO1xuICB9XG5cbiAgd3JpdGVJbnQxNkxFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuc2V0SW50MTYoXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWx1ZSxcbiAgICAgIHRydWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDI7XG4gIH1cblxuICB3cml0ZUludDMyQkUodmFsdWUsIG9mZnNldCA9IDApIHtcbiAgICBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCwgdGhpcy5ieXRlTGVuZ3RoKS5zZXRVaW50MzIoXG4gICAgICBvZmZzZXQsXG4gICAgICB2YWx1ZVxuICAgICk7XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgNDtcbiAgfVxuXG4gIHdyaXRlSW50MzJMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldEludDMyKFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWUsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG5cbiAgd3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldFVpbnQ4KFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDE7XG4gIH1cblxuICB3cml0ZVVJbnQxNkJFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuc2V0VWludDE2KFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWVcbiAgICApO1xuXG4gICAgcmV0dXJuIG9mZnNldCArIDI7XG4gIH1cblxuICB3cml0ZVVJbnQxNkxFKHZhbHVlLCBvZmZzZXQgPSAwKSB7XG4gICAgbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQsIHRoaXMuYnl0ZUxlbmd0aCkuc2V0VWludDE2KFxuICAgICAgb2Zmc2V0LFxuICAgICAgdmFsdWUsXG4gICAgICB0cnVlXG4gICAgKTtcblxuICAgIHJldHVybiBvZmZzZXQgKyAyO1xuICB9XG5cbiAgd3JpdGVVSW50MzJCRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldFVpbnQzMihcbiAgICAgIG9mZnNldCxcbiAgICAgIHZhbHVlXG4gICAgKTtcblxuICAgIHJldHVybiBvZmZzZXQgKyA0O1xuICB9XG5cbiAgd3JpdGVVSW50MzJMRSh2YWx1ZSwgb2Zmc2V0ID0gMCkge1xuICAgIG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlciwgdGhpcy5ieXRlT2Zmc2V0LCB0aGlzLmJ5dGVMZW5ndGgpLnNldFVpbnQzMihcbiAgICAgIG9mZnNldCxcbiAgICAgIHZhbHVlLFxuICAgICAgdHJ1ZVxuICAgICk7XG5cbiAgICByZXR1cm4gb2Zmc2V0ICsgNDtcbiAgfVxufVxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXI7XG5cbmlmICghaGFzR2xvYmFsQnVmZmVyKSB7XG4gIGlmIChoYXNCdWZmZXJNb2R1bGUpIHtcbiAgICAvLyBFeGlzdGluZ0J1ZmZlciBpcyBsaWtlbHkgdG8gYmUgYSBwb2x5ZmlsbCwgaGVuY2Ugd2UgY2FuIG92ZXJyaWRlIGl0XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfYnVmZmVyLmRlZmF1bHQsICdCdWZmZXInLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBCdWZmZXIsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdywgJ0J1ZmZlcicsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgdmFsdWU6IEJ1ZmZlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmNvbnN0IExpdGVCdWZmZXIgPSBoYXNHbG9iYWxCdWZmZXIgPyBnbG9iYWwuQnVmZmVyIDogQnVmZmVyO1xuZXhwb3J0cy5MaXRlQnVmZmVyID0gTGl0ZUJ1ZmZlcjtcbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qIGVzbGludC1kaXNhYmxlIGNvbnNpc3RlbnQtcmV0dXJuLCBuby1iaXR3aXNlICovIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgZXhwb3J0cyxcbiAgJ19fZXNNb2R1bGUnLFxuICB7dmFsdWU6IHRydWV9XG4pO1xuZXhwb3J0cy5kZXNlcmlhbGl6ZUZyYW1lV2l0aExlbmd0aCA9IGRlc2VyaWFsaXplRnJhbWVXaXRoTGVuZ3RoO1xuZXhwb3J0cy5kZXNlcmlhbGl6ZUZyYW1lcyA9IGRlc2VyaWFsaXplRnJhbWVzO1xuZXhwb3J0cy5zZXJpYWxpemVGcmFtZVdpdGhMZW5ndGggPSBzZXJpYWxpemVGcmFtZVdpdGhMZW5ndGg7XG5leHBvcnRzLmRlc2VyaWFsaXplRnJhbWUgPSBkZXNlcmlhbGl6ZUZyYW1lO1xuZXhwb3J0cy5zZXJpYWxpemVGcmFtZSA9IHNlcmlhbGl6ZUZyYW1lO1xuZXhwb3J0cy5zaXplT2ZGcmFtZSA9IHNpemVPZkZyYW1lO1xuXG52YXIgX0ludmFyaWFudCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9JbnZhcmlhbnQnKSk7XG52YXIgX1JTb2NrZXRGcmFtZSA9IHJlcXVpcmUoJy4vUlNvY2tldEZyYW1lJyk7XG5cbnZhciBfUlNvY2tldEVuY29kaW5nID0gcmVxdWlyZSgnLi9SU29ja2V0RW5jb2RpbmcnKTtcbnZhciBfUlNvY2tldEJ1ZmZlclV0aWxzID0gcmVxdWlyZSgnLi9SU29ja2V0QnVmZmVyVXRpbHMnKTtcbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cblxuLyoqXG4gKiBGcmFtZSBoZWFkZXIgaXM6XG4gKiAtIHN0cmVhbSBpZCAodWludDMyID0gNClcbiAqIC0gdHlwZSArIGZsYWdzICh1aW50IDE2ID0gMilcbiAqL1xuY29uc3QgRlJBTUVfSEVBREVSX1NJWkUgPSA2O1xuXG4vKipcbiAqIFNpemUgb2YgZnJhbWUgbGVuZ3RoIGFuZCBtZXRhZGF0YSBsZW5ndGggZmllbGRzLlxuICovXG5jb25zdCBVSU5UMjRfU0laRSA9IDM7XG5cbi8qKlxuICogUmVhZHMgYSBmcmFtZSBmcm9tIGEgYnVmZmVyIHRoYXQgaXMgcHJlZml4ZWQgd2l0aCB0aGUgZnJhbWUgbGVuZ3RoLlxuICovXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUZyYW1lV2l0aExlbmd0aChidWZmZXIsIGVuY29kZXJzKSB7XG4gIGNvbnN0IGZyYW1lTGVuZ3RoID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMucmVhZFVJbnQyNEJFKShidWZmZXIsIDApO1xuICByZXR1cm4gZGVzZXJpYWxpemVGcmFtZShcbiAgICBidWZmZXIuc2xpY2UoVUlOVDI0X1NJWkUsIFVJTlQyNF9TSVpFICsgZnJhbWVMZW5ndGgpLFxuICAgIGVuY29kZXJzXG4gICk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBidWZmZXIgdGhhdCBtYXkgY29udGFpbiB6ZXJvIG9yIG1vcmUgbGVuZ3RoLXByZWZpeGVkIGZyYW1lcyBmb2xsb3dlZFxuICogYnkgemVybyBvciBtb3JlIGJ5dGVzIG9mIGEgKHBhcnRpYWwpIHN1YnNlcXVlbnQgZnJhbWUsIHJldHVybnMgYW4gYXJyYXkgb2ZcbiAqIHRoZSBmcmFtZXMgYW5kIGEgYnVmZmVyIG9mIHRoZSBsZWZ0b3ZlciBieXRlcy5cbiAqL1xuZnVuY3Rpb24gZGVzZXJpYWxpemVGcmFtZXMoYnVmZmVyLCBlbmNvZGVycykge1xuICBjb25zdCBmcmFtZXMgPSBbXTtcbiAgbGV0IG9mZnNldCA9IDA7XG4gIHdoaWxlIChvZmZzZXQgKyBVSU5UMjRfU0laRSA8IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBjb25zdCBmcmFtZUxlbmd0aCA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLnJlYWRVSW50MjRCRSkoYnVmZmVyLCBvZmZzZXQpO1xuICAgIGNvbnN0IGZyYW1lU3RhcnQgPSBvZmZzZXQgKyBVSU5UMjRfU0laRTtcbiAgICBjb25zdCBmcmFtZUVuZCA9IGZyYW1lU3RhcnQgKyBmcmFtZUxlbmd0aDtcbiAgICBpZiAoZnJhbWVFbmQgPiBidWZmZXIubGVuZ3RoKSB7XG4gICAgICAvLyBub3QgYWxsIGJ5dGVzIG9mIG5leHQgZnJhbWUgcmVjZWl2ZWRcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBmcmFtZUJ1ZmZlciA9IGJ1ZmZlci5zbGljZShmcmFtZVN0YXJ0LCBmcmFtZUVuZCk7XG4gICAgY29uc3QgZnJhbWUgPSBkZXNlcmlhbGl6ZUZyYW1lKGZyYW1lQnVmZmVyLCBlbmNvZGVycyk7XG4gICAgZnJhbWVzLnB1c2goZnJhbWUpO1xuICAgIG9mZnNldCA9IGZyYW1lRW5kO1xuICB9XG4gIHJldHVybiBbZnJhbWVzLCBidWZmZXIuc2xpY2Uob2Zmc2V0LCBidWZmZXIubGVuZ3RoKV07XG59XG5cbi8qKlxuICogV3JpdGVzIGEgZnJhbWUgdG8gYSBidWZmZXIgd2l0aCBhIGxlbmd0aCBwcmVmaXguXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZUZyYW1lV2l0aExlbmd0aChmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgYnVmZmVyID0gc2VyaWFsaXplRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgY29uc3QgbGVuZ3RoUHJlZml4ZWQgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIGJ1ZmZlci5sZW5ndGggKyBVSU5UMjRfU0laRVxuICApO1xuICAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQyNEJFKShsZW5ndGhQcmVmaXhlZCwgYnVmZmVyLmxlbmd0aCwgMCk7XG4gIGJ1ZmZlci5jb3B5KGxlbmd0aFByZWZpeGVkLCBVSU5UMjRfU0laRSwgMCwgYnVmZmVyLmxlbmd0aCk7XG4gIHJldHVybiBsZW5ndGhQcmVmaXhlZDtcbn1cblxuLyoqXG4gKiBSZWFkIGEgZnJhbWUgZnJvbSB0aGUgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUZyYW1lKGJ1ZmZlciwgZW5jb2RlcnMpIHtcbiAgZW5jb2RlcnMgPSBlbmNvZGVycyB8fCBfUlNvY2tldEVuY29kaW5nLlV0ZjhFbmNvZGVycztcbiAgbGV0IG9mZnNldCA9IDA7XG4gIGNvbnN0IHN0cmVhbUlkID0gYnVmZmVyLnJlYWRJbnQzMkJFKG9mZnNldCk7XG4gIG9mZnNldCArPSA0O1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICBzdHJlYW1JZCA+PSAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBmcmFtZSwgZXhwZWN0ZWQgYSBwb3NpdGl2ZSBzdHJlYW0gaWQsIGdvdCBgJXMuJyxcbiAgICBzdHJlYW1JZFxuICApO1xuXG4gIGNvbnN0IHR5cGVBbmRGbGFncyA9IGJ1ZmZlci5yZWFkVUludDE2QkUob2Zmc2V0KTtcbiAgb2Zmc2V0ICs9IDI7XG4gIGNvbnN0IHR5cGUgPSB0eXBlQW5kRmxhZ3MgPj4+IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRV9PRkZGU0VUOyAvLyBrZWVwIGhpZ2hlc3QgNiBiaXRzXG4gIGNvbnN0IGZsYWdzID0gdHlwZUFuZEZsYWdzICYgX1JTb2NrZXRGcmFtZS5GTEFHU19NQVNLOyAvLyBrZWVwIGxvd2VzdCAxMCBiaXRzXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5TRVRVUDpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVNldHVwRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUEFZTE9BRDpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVBheWxvYWRGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5FUlJPUjpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZUVycm9yRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuS0VFUEFMSVZFOlxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplS2VlcEFsaXZlRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9GTkY6XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVSZXF1ZXN0Rm5mRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9SRVNQT05TRTpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVJlcXVlc3RSZXNwb25zZUZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfU1RSRUFNOlxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplUmVxdWVzdFN0cmVhbUZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfQ0hBTk5FTDpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVJlcXVlc3RDaGFubmVsRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuTUVUQURBVEFfUFVTSDpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZU1ldGFkYXRhUHVzaEZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTjpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVJlcXVlc3RORnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FOlxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplUmVzdW1lRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FX09LOlxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplUmVzdW1lT2tGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5DQU5DRUw6XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVDYW5jZWxGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5MRUFTRTpcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZUxlYXNlRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKTtcbiAgICBkZWZhdWx0OlxuICAgICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICAgIGZhbHNlLFxuICAgICAgICAnUlNvY2tldEJpbmFyeUZyYW1pbmc6IFVuc3VwcG9ydGVkIGZyYW1lIHR5cGUgYCVzYC4nLFxuICAgICAgICAoMCwgX1JTb2NrZXRGcmFtZS5nZXRGcmFtZVR5cGVOYW1lKSh0eXBlKVxuICAgICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgdGhlIGZyYW1lIHRvIGEgKGJpbmFyeSkgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgZW5jb2RlcnMgPSBlbmNvZGVycyB8fCBfUlNvY2tldEVuY29kaW5nLlV0ZjhFbmNvZGVycztcbiAgc3dpdGNoIChmcmFtZS50eXBlKSB7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlNFVFVQOlxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZVNldHVwRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUEFZTE9BRDpcbiAgICAgIHJldHVybiBzZXJpYWxpemVQYXlsb2FkRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuRVJST1I6XG4gICAgICByZXR1cm4gc2VyaWFsaXplRXJyb3JGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5LRUVQQUxJVkU6XG4gICAgICByZXR1cm4gc2VyaWFsaXplS2VlcEFsaXZlRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9GTkY6XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfUkVTUE9OU0U6XG4gICAgICByZXR1cm4gc2VyaWFsaXplUmVxdWVzdEZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfU1RSRUFNOlxuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0NIQU5ORUw6XG4gICAgICByZXR1cm4gc2VyaWFsaXplUmVxdWVzdE1hbnlGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5NRVRBREFUQV9QVVNIOlxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZU1ldGFkYXRhUHVzaEZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTjpcbiAgICAgIHJldHVybiBzZXJpYWxpemVSZXF1ZXN0TkZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFU1VNRTpcbiAgICAgIHJldHVybiBzZXJpYWxpemVSZXN1bWVGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVNVTUVfT0s6XG4gICAgICByZXR1cm4gc2VyaWFsaXplUmVzdW1lT2tGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5DQU5DRUw6XG4gICAgICByZXR1cm4gc2VyaWFsaXplQ2FuY2VsRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuTEVBU0U6XG4gICAgICByZXR1cm4gc2VyaWFsaXplTGVhc2VGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICAgICAgZmFsc2UsXG4gICAgICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogVW5zdXBwb3J0ZWQgZnJhbWUgdHlwZSBgJXNgLicsXG4gICAgICAgICgwLCBfUlNvY2tldEZyYW1lLmdldEZyYW1lVHlwZU5hbWUpKGZyYW1lLnR5cGUpXG4gICAgICApO1xuICB9XG59XG4vKipcbiAqIEJ5dGUgc2l6ZSBvZiBmcmFtZSB3aXRob3V0IHNpemUgcHJlZml4XG4gKi9cbmZ1bmN0aW9uIHNpemVPZkZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBlbmNvZGVycyA9IGVuY29kZXJzIHx8IF9SU29ja2V0RW5jb2RpbmcuVXRmOEVuY29kZXJzO1xuICBzd2l0Y2ggKGZyYW1lLnR5cGUpIHtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuU0VUVVA6XG4gICAgICByZXR1cm4gc2l6ZU9mU2V0dXBGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5QQVlMT0FEOlxuICAgICAgcmV0dXJuIHNpemVPZlBheWxvYWRGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5FUlJPUjpcbiAgICAgIHJldHVybiBzaXplT2ZFcnJvckZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLktFRVBBTElWRTpcbiAgICAgIHJldHVybiBzaXplT2ZLZWVwQWxpdmVGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0ZORjpcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9SRVNQT05TRTpcbiAgICAgIHJldHVybiBzaXplT2ZSZXF1ZXN0RnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9TVFJFQU06XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfQ0hBTk5FTDpcbiAgICAgIHJldHVybiBzaXplT2ZSZXF1ZXN0TWFueUZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLk1FVEFEQVRBX1BVU0g6XG4gICAgICByZXR1cm4gc2l6ZU9mTWV0YWRhdGFQdXNoRnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9OOlxuICAgICAgcmV0dXJuIHNpemVPZlJlcXVlc3RORnJhbWUoZnJhbWUsIGVuY29kZXJzKTtcbiAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FOlxuICAgICAgcmV0dXJuIHNpemVPZlJlc3VtZUZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFU1VNRV9PSzpcbiAgICAgIHJldHVybiBzaXplT2ZSZXN1bWVPa0ZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkNBTkNFTDpcbiAgICAgIHJldHVybiBzaXplT2ZDYW5jZWxGcmFtZShmcmFtZSwgZW5jb2RlcnMpO1xuICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5MRUFTRTpcbiAgICAgIHJldHVybiBzaXplT2ZMZWFzZUZyYW1lKGZyYW1lLCBlbmNvZGVycyk7XG4gICAgZGVmYXVsdDpcbiAgICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBVbnN1cHBvcnRlZCBmcmFtZSB0eXBlIGAlc2AuJyxcbiAgICAgICAgKDAsIF9SU29ja2V0RnJhbWUuZ2V0RnJhbWVUeXBlTmFtZSkoZnJhbWUudHlwZSlcbiAgICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXcml0ZXMgYSBTRVRVUCBmcmFtZSBpbnRvIGEgbmV3IGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqXG4gKiBQcmVmaXggc2l6ZSBpczpcbiAqIC0gdmVyc2lvbiAoMnggdWludDE2ID0gNClcbiAqIC0ga2VlcGFsaXZlICh1aW50MzIgPSA0KVxuICogLSBsaWZldGltZSAodWludDMyID0gNClcbiAqIC0gbWltZSBsZW5ndGhzICgyeCB1aW50OCA9IDIpXG4gKi9cbmNvbnN0IFNFVFVQX0ZJWEVEX1NJWkUgPSAxNDtcbmNvbnN0IFJFU1VNRV9UT0tFTl9MRU5HVEhfU0laRSA9IDI7XG5mdW5jdGlvbiBzZXJpYWxpemVTZXR1cEZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBjb25zdCByZXN1bWVUb2tlbkxlbmd0aCA9XG4gICAgZnJhbWUucmVzdW1lVG9rZW4gIT0gbnVsbFxuICAgICAgPyBlbmNvZGVycy5yZXN1bWVUb2tlbi5ieXRlTGVuZ3RoKGZyYW1lLnJlc3VtZVRva2VuKVxuICAgICAgOiAwO1xuICBjb25zdCBtZXRhZGF0YU1pbWVUeXBlTGVuZ3RoID1cbiAgICBmcmFtZS5tZXRhZGF0YU1pbWVUeXBlICE9IG51bGxcbiAgICAgID8gZW5jb2RlcnMubWV0YWRhdGFNaW1lVHlwZS5ieXRlTGVuZ3RoKGZyYW1lLm1ldGFkYXRhTWltZVR5cGUpXG4gICAgICA6IDA7XG4gIGNvbnN0IGRhdGFNaW1lVHlwZUxlbmd0aCA9XG4gICAgZnJhbWUuZGF0YU1pbWVUeXBlICE9IG51bGxcbiAgICAgID8gZW5jb2RlcnMuZGF0YU1pbWVUeXBlLmJ5dGVMZW5ndGgoZnJhbWUuZGF0YU1pbWVUeXBlKVxuICAgICAgOiAwO1xuICBjb25zdCBwYXlsb2FkTGVuZ3RoID0gZ2V0UGF5bG9hZExlbmd0aChmcmFtZSwgZW5jb2RlcnMpO1xuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIEZSQU1FX0hFQURFUl9TSVpFICtcbiAgICAgIFNFVFVQX0ZJWEVEX1NJWkUgKyAvL1xuICAgICAgKHJlc3VtZVRva2VuTGVuZ3RoID8gUkVTVU1FX1RPS0VOX0xFTkdUSF9TSVpFICsgcmVzdW1lVG9rZW5MZW5ndGggOiAwKSArXG4gICAgICBtZXRhZGF0YU1pbWVUeXBlTGVuZ3RoICtcbiAgICAgIGRhdGFNaW1lVHlwZUxlbmd0aCArXG4gICAgICBwYXlsb2FkTGVuZ3RoXG4gICk7XG5cbiAgbGV0IG9mZnNldCA9IHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICBvZmZzZXQgPSBidWZmZXIud3JpdGVVSW50MTZCRShmcmFtZS5tYWpvclZlcnNpb24sIG9mZnNldCk7XG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQxNkJFKGZyYW1lLm1pbm9yVmVyc2lvbiwgb2Zmc2V0KTtcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDMyQkUoZnJhbWUua2VlcEFsaXZlLCBvZmZzZXQpO1xuICBvZmZzZXQgPSBidWZmZXIud3JpdGVVSW50MzJCRShmcmFtZS5saWZldGltZSwgb2Zmc2V0KTtcblxuICBpZiAoZnJhbWUuZmxhZ3MgJiBfUlNvY2tldEZyYW1lLkZMQUdTLlJFU1VNRV9FTkFCTEUpIHtcbiAgICBvZmZzZXQgPSBidWZmZXIud3JpdGVVSW50MTZCRShyZXN1bWVUb2tlbkxlbmd0aCwgb2Zmc2V0KTtcbiAgICBpZiAoZnJhbWUucmVzdW1lVG9rZW4gIT0gbnVsbCkge1xuICAgICAgb2Zmc2V0ID0gZW5jb2RlcnMucmVzdW1lVG9rZW4uZW5jb2RlKFxuICAgICAgICBmcmFtZS5yZXN1bWVUb2tlbixcbiAgICAgICAgYnVmZmVyLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG9mZnNldCArIHJlc3VtZVRva2VuTGVuZ3RoXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQ4KG1ldGFkYXRhTWltZVR5cGVMZW5ndGgsIG9mZnNldCk7XG4gIGlmIChmcmFtZS5tZXRhZGF0YU1pbWVUeXBlICE9IG51bGwpIHtcbiAgICBvZmZzZXQgPSBlbmNvZGVycy5tZXRhZGF0YU1pbWVUeXBlLmVuY29kZShcbiAgICAgIGZyYW1lLm1ldGFkYXRhTWltZVR5cGUsXG4gICAgICBidWZmZXIsXG4gICAgICBvZmZzZXQsXG4gICAgICBvZmZzZXQgKyBtZXRhZGF0YU1pbWVUeXBlTGVuZ3RoXG4gICAgKTtcbiAgfVxuXG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQ4KGRhdGFNaW1lVHlwZUxlbmd0aCwgb2Zmc2V0KTtcbiAgaWYgKGZyYW1lLmRhdGFNaW1lVHlwZSAhPSBudWxsKSB7XG4gICAgb2Zmc2V0ID0gZW5jb2RlcnMuZGF0YU1pbWVUeXBlLmVuY29kZShcbiAgICAgIGZyYW1lLmRhdGFNaW1lVHlwZSxcbiAgICAgIGJ1ZmZlcixcbiAgICAgIG9mZnNldCxcbiAgICAgIG9mZnNldCArIGRhdGFNaW1lVHlwZUxlbmd0aFxuICAgICk7XG4gIH1cblxuICB3cml0ZVBheWxvYWQoZnJhbWUsIGJ1ZmZlciwgZW5jb2RlcnMsIG9mZnNldCk7XG4gIHJldHVybiBidWZmZXI7XG59XG5cbmZ1bmN0aW9uIHNpemVPZlNldHVwRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IHJlc3VtZVRva2VuTGVuZ3RoID1cbiAgICBmcmFtZS5yZXN1bWVUb2tlbiAhPSBudWxsXG4gICAgICA/IGVuY29kZXJzLnJlc3VtZVRva2VuLmJ5dGVMZW5ndGgoZnJhbWUucmVzdW1lVG9rZW4pXG4gICAgICA6IDA7XG4gIGNvbnN0IG1ldGFkYXRhTWltZVR5cGVMZW5ndGggPVxuICAgIGZyYW1lLm1ldGFkYXRhTWltZVR5cGUgIT0gbnVsbFxuICAgICAgPyBlbmNvZGVycy5tZXRhZGF0YU1pbWVUeXBlLmJ5dGVMZW5ndGgoZnJhbWUubWV0YWRhdGFNaW1lVHlwZSlcbiAgICAgIDogMDtcbiAgY29uc3QgZGF0YU1pbWVUeXBlTGVuZ3RoID1cbiAgICBmcmFtZS5kYXRhTWltZVR5cGUgIT0gbnVsbFxuICAgICAgPyBlbmNvZGVycy5kYXRhTWltZVR5cGUuYnl0ZUxlbmd0aChmcmFtZS5kYXRhTWltZVR5cGUpXG4gICAgICA6IDA7XG4gIGNvbnN0IHBheWxvYWRMZW5ndGggPSBnZXRQYXlsb2FkTGVuZ3RoKGZyYW1lLCBlbmNvZGVycyk7XG4gIHJldHVybiAoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgK1xuICAgIFNFVFVQX0ZJWEVEX1NJWkUgKyAvL1xuICAgIChyZXN1bWVUb2tlbkxlbmd0aCA/IFJFU1VNRV9UT0tFTl9MRU5HVEhfU0laRSArIHJlc3VtZVRva2VuTGVuZ3RoIDogMCkgK1xuICAgIG1ldGFkYXRhTWltZVR5cGVMZW5ndGggK1xuICAgIGRhdGFNaW1lVHlwZUxlbmd0aCArXG4gICAgcGF5bG9hZExlbmd0aFxuICApO1xufVxuXG4vKipcbiAqIFJlYWRzIGEgU0VUVVAgZnJhbWUgZnJvbSB0aGUgYnVmZmVyIGFuZCByZXR1cm5zIGl0LlxuICovXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVNldHVwRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKSB7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIHN0cmVhbUlkID09PSAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBTRVRVUCBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlIDAuJ1xuICApO1xuXG4gIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGxldCBvZmZzZXQgPSBGUkFNRV9IRUFERVJfU0laRTtcbiAgY29uc3QgbWFqb3JWZXJzaW9uID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQpO1xuICBvZmZzZXQgKz0gMjtcbiAgY29uc3QgbWlub3JWZXJzaW9uID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQpO1xuICBvZmZzZXQgKz0gMjtcblxuICBjb25zdCBrZWVwQWxpdmUgPSBidWZmZXIucmVhZEludDMyQkUob2Zmc2V0KTtcbiAgb2Zmc2V0ICs9IDQ7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIGtlZXBBbGl2ZSA+PSAwICYmIGtlZXBBbGl2ZSA8PSBfUlNvY2tldEZyYW1lLk1BWF9LRUVQQUxJVkUsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFNFVFVQIGZyYW1lLCBleHBlY3RlZCBrZWVwQWxpdmUgdG8gYmUgJyArXG4gICAgICAnPj0gMCBhbmQgPD0gJXMuIEdvdCBgJXNgLicsXG4gICAgX1JTb2NrZXRGcmFtZS5NQVhfS0VFUEFMSVZFLFxuICAgIGtlZXBBbGl2ZVxuICApO1xuXG4gIGNvbnN0IGxpZmV0aW1lID0gYnVmZmVyLnJlYWRJbnQzMkJFKG9mZnNldCk7XG4gIG9mZnNldCArPSA0O1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICBsaWZldGltZSA+PSAwICYmIGxpZmV0aW1lIDw9IF9SU29ja2V0RnJhbWUuTUFYX0xJRkVUSU1FLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBTRVRVUCBmcmFtZSwgZXhwZWN0ZWQgbGlmZXRpbWUgdG8gYmUgJyArXG4gICAgICAnPj0gMCBhbmQgPD0gJXMuIEdvdCBgJXNgLicsXG4gICAgX1JTb2NrZXRGcmFtZS5NQVhfTElGRVRJTUUsXG4gICAgbGlmZXRpbWVcbiAgKTtcblxuICBsZXQgcmVzdW1lVG9rZW4gPSBudWxsO1xuICBpZiAoZmxhZ3MgJiBfUlNvY2tldEZyYW1lLkZMQUdTLlJFU1VNRV9FTkFCTEUpIHtcbiAgICBjb25zdCByZXN1bWVUb2tlbkxlbmd0aCA9IGJ1ZmZlci5yZWFkSW50MTZCRShvZmZzZXQpO1xuICAgIG9mZnNldCArPSAyO1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgcmVzdW1lVG9rZW5MZW5ndGggPj0gMCAmJlxuICAgICAgICByZXN1bWVUb2tlbkxlbmd0aCA8PSBfUlNvY2tldEZyYW1lLk1BWF9SRVNVTUVfTEVOR1RILFxuICAgICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFNFVFVQIGZyYW1lLCBleHBlY3RlZCByZXN1bWVUb2tlbiBsZW5ndGggJyArXG4gICAgICAgICd0byBiZSA+PSAwIGFuZCA8PSAlcy4gR290IGAlc2AuJyxcbiAgICAgIF9SU29ja2V0RnJhbWUuTUFYX1JFU1VNRV9MRU5HVEgsXG4gICAgICByZXN1bWVUb2tlbkxlbmd0aFxuICAgICk7XG5cbiAgICByZXN1bWVUb2tlbiA9IGVuY29kZXJzLnJlc3VtZVRva2VuLmRlY29kZShcbiAgICAgIGJ1ZmZlcixcbiAgICAgIG9mZnNldCxcbiAgICAgIG9mZnNldCArIHJlc3VtZVRva2VuTGVuZ3RoXG4gICAgKTtcblxuICAgIG9mZnNldCArPSByZXN1bWVUb2tlbkxlbmd0aDtcbiAgfVxuXG4gIGNvbnN0IG1ldGFkYXRhTWltZVR5cGVMZW5ndGggPSBidWZmZXIucmVhZFVJbnQ4KG9mZnNldCk7XG4gIG9mZnNldCArPSAxO1xuICBjb25zdCBtZXRhZGF0YU1pbWVUeXBlID0gZW5jb2RlcnMubWV0YWRhdGFNaW1lVHlwZS5kZWNvZGUoXG4gICAgYnVmZmVyLFxuICAgIG9mZnNldCxcbiAgICBvZmZzZXQgKyBtZXRhZGF0YU1pbWVUeXBlTGVuZ3RoXG4gICk7XG5cbiAgb2Zmc2V0ICs9IG1ldGFkYXRhTWltZVR5cGVMZW5ndGg7XG5cbiAgY29uc3QgZGF0YU1pbWVUeXBlTGVuZ3RoID0gYnVmZmVyLnJlYWRVSW50OChvZmZzZXQpO1xuICBvZmZzZXQgKz0gMTtcbiAgY29uc3QgZGF0YU1pbWVUeXBlID0gZW5jb2RlcnMuZGF0YU1pbWVUeXBlLmRlY29kZShcbiAgICBidWZmZXIsXG4gICAgb2Zmc2V0LFxuICAgIG9mZnNldCArIGRhdGFNaW1lVHlwZUxlbmd0aFxuICApO1xuXG4gIG9mZnNldCArPSBkYXRhTWltZVR5cGVMZW5ndGg7XG5cbiAgY29uc3QgZnJhbWUgPSB7XG4gICAgZGF0YTogbnVsbCxcbiAgICBkYXRhTWltZVR5cGUsXG4gICAgZmxhZ3MsXG4gICAga2VlcEFsaXZlLFxuICAgIGxlbmd0aCxcbiAgICBsaWZldGltZSxcbiAgICBtYWpvclZlcnNpb24sXG4gICAgbWV0YWRhdGE6IG51bGwsXG4gICAgbWV0YWRhdGFNaW1lVHlwZSxcbiAgICBtaW5vclZlcnNpb24sXG4gICAgcmVzdW1lVG9rZW4sXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5TRVRVUCxcbiAgfTtcblxuICByZWFkUGF5bG9hZChidWZmZXIsIGZyYW1lLCBlbmNvZGVycywgb2Zmc2V0KTtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKipcbiAqIFdyaXRlcyBhbiBFUlJPUiBmcmFtZSBpbnRvIGEgbmV3IGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqXG4gKiBQcmVmaXggc2l6ZSBpcyBmb3IgdGhlIGVycm9yIGNvZGUgKHVpbnQzMiA9IDQpLlxuICovXG5jb25zdCBFUlJPUl9GSVhFRF9TSVpFID0gNDtcbmZ1bmN0aW9uIHNlcmlhbGl6ZUVycm9yRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IG1lc3NhZ2VMZW5ndGggPVxuICAgIGZyYW1lLm1lc3NhZ2UgIT0gbnVsbCA/IGVuY29kZXJzLm1lc3NhZ2UuYnl0ZUxlbmd0aChmcmFtZS5tZXNzYWdlKSA6IDA7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgKyBFUlJPUl9GSVhFRF9TSVpFICsgbWVzc2FnZUxlbmd0aFxuICApO1xuXG4gIGxldCBvZmZzZXQgPSB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKTtcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDMyQkUoZnJhbWUuY29kZSwgb2Zmc2V0KTtcbiAgaWYgKGZyYW1lLm1lc3NhZ2UgIT0gbnVsbCkge1xuICAgIGVuY29kZXJzLm1lc3NhZ2UuZW5jb2RlKFxuICAgICAgZnJhbWUubWVzc2FnZSxcbiAgICAgIGJ1ZmZlcixcbiAgICAgIG9mZnNldCxcbiAgICAgIG9mZnNldCArIG1lc3NhZ2VMZW5ndGhcbiAgICApO1xuICB9XG4gIHJldHVybiBidWZmZXI7XG59XG5cbmZ1bmN0aW9uIHNpemVPZkVycm9yRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IG1lc3NhZ2VMZW5ndGggPVxuICAgIGZyYW1lLm1lc3NhZ2UgIT0gbnVsbCA/IGVuY29kZXJzLm1lc3NhZ2UuYnl0ZUxlbmd0aChmcmFtZS5tZXNzYWdlKSA6IDA7XG4gIHJldHVybiBGUkFNRV9IRUFERVJfU0laRSArIEVSUk9SX0ZJWEVEX1NJWkUgKyBtZXNzYWdlTGVuZ3RoO1xufVxuXG4vKipcbiAqIFJlYWRzIGFuIEVSUk9SIGZyYW1lIGZyb20gdGhlIGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqL1xuZnVuY3Rpb24gZGVzZXJpYWxpemVFcnJvckZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycykge1xuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBsZXQgb2Zmc2V0ID0gRlJBTUVfSEVBREVSX1NJWkU7XG4gIGNvbnN0IGNvZGUgPSBidWZmZXIucmVhZEludDMyQkUob2Zmc2V0KTtcbiAgb2Zmc2V0ICs9IDQ7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIGNvZGUgPj0gMCAmJiBjb2RlIDw9IF9SU29ja2V0RnJhbWUuTUFYX0NPREUsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIEVSUk9SIGZyYW1lLCBleHBlY3RlZCBjb2RlIHRvIGJlID49IDAgYW5kIDw9ICVzLiBHb3QgYCVzYC4nLFxuICAgIF9SU29ja2V0RnJhbWUuTUFYX0NPREUsXG4gICAgY29kZVxuICApO1xuXG4gIGNvbnN0IG1lc3NhZ2VMZW5ndGggPSBidWZmZXIubGVuZ3RoIC0gb2Zmc2V0O1xuICBsZXQgbWVzc2FnZSA9ICcnO1xuICBpZiAobWVzc2FnZUxlbmd0aCA+IDApIHtcbiAgICBtZXNzYWdlID0gZW5jb2RlcnMubWVzc2FnZS5kZWNvZGUoYnVmZmVyLCBvZmZzZXQsIG9mZnNldCArIG1lc3NhZ2VMZW5ndGgpO1xuICAgIG9mZnNldCArPSBtZXNzYWdlTGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb2RlLFxuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtZXNzYWdlLFxuICAgIHN0cmVhbUlkLFxuICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuRVJST1IsXG4gIH07XG59XG5cbi8qKlxuICogV3JpdGVzIGEgS0VFUEFMSVZFIGZyYW1lIGludG8gYSBuZXcgYnVmZmVyIGFuZCByZXR1cm5zIGl0LlxuICpcbiAqIFByZWZpeCBzaXplIGlzIGZvciB0aGUgbGFzdCByZWNlaXZlZCBwb3NpdGlvbiAodWludDY0ID0gOCkuXG4gKi9cbmNvbnN0IEtFRVBBTElWRV9GSVhFRF9TSVpFID0gODtcbmZ1bmN0aW9uIHNlcmlhbGl6ZUtlZXBBbGl2ZUZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBjb25zdCBkYXRhTGVuZ3RoID1cbiAgICBmcmFtZS5kYXRhICE9IG51bGwgPyBlbmNvZGVycy5kYXRhLmJ5dGVMZW5ndGgoZnJhbWUuZGF0YSkgOiAwO1xuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIEZSQU1FX0hFQURFUl9TSVpFICsgS0VFUEFMSVZFX0ZJWEVEX1NJWkUgKyBkYXRhTGVuZ3RoXG4gICk7XG5cbiAgbGV0IG9mZnNldCA9IHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICBvZmZzZXQgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQ2NEJFKShcbiAgICBidWZmZXIsXG4gICAgZnJhbWUubGFzdFJlY2VpdmVkUG9zaXRpb24sXG4gICAgb2Zmc2V0XG4gICk7XG4gIGlmIChmcmFtZS5kYXRhICE9IG51bGwpIHtcbiAgICBlbmNvZGVycy5kYXRhLmVuY29kZShmcmFtZS5kYXRhLCBidWZmZXIsIG9mZnNldCwgb2Zmc2V0ICsgZGF0YUxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mS2VlcEFsaXZlRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IGRhdGFMZW5ndGggPVxuICAgIGZyYW1lLmRhdGEgIT0gbnVsbCA/IGVuY29kZXJzLmRhdGEuYnl0ZUxlbmd0aChmcmFtZS5kYXRhKSA6IDA7XG4gIHJldHVybiBGUkFNRV9IRUFERVJfU0laRSArIEtFRVBBTElWRV9GSVhFRF9TSVpFICsgZGF0YUxlbmd0aDtcbn1cblxuLyoqXG4gKiBSZWFkcyBhIEtFRVBBTElWRSBmcmFtZSBmcm9tIHRoZSBidWZmZXIgYW5kIHJldHVybnMgaXQuXG4gKi9cbmZ1bmN0aW9uIGRlc2VyaWFsaXplS2VlcEFsaXZlRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKSB7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIHN0cmVhbUlkID09PSAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBLRUVQQUxJVkUgZnJhbWUsIGV4cGVjdGVkIHN0cmVhbSBpZCB0byBiZSAwLidcbiAgKTtcblxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBsZXQgb2Zmc2V0ID0gRlJBTUVfSEVBREVSX1NJWkU7XG4gIGNvbnN0IGxhc3RSZWNlaXZlZFBvc2l0aW9uID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMucmVhZFVJbnQ2NEJFKShcbiAgICBidWZmZXIsXG4gICAgb2Zmc2V0XG4gICk7XG4gIG9mZnNldCArPSA4O1xuICBsZXQgZGF0YSA9IG51bGw7XG4gIGlmIChvZmZzZXQgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgZGF0YSA9IGVuY29kZXJzLmRhdGEuZGVjb2RlKGJ1ZmZlciwgb2Zmc2V0LCBidWZmZXIubGVuZ3RoKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZGF0YSxcbiAgICBmbGFncyxcbiAgICBsYXN0UmVjZWl2ZWRQb3NpdGlvbixcbiAgICBsZW5ndGgsXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5LRUVQQUxJVkUsXG4gIH07XG59XG5cbi8qKlxuICogV3JpdGVzIGEgTEVBU0UgZnJhbWUgaW50byBhIG5ldyBidWZmZXIgYW5kIHJldHVybnMgaXQuXG4gKlxuICogUHJlZml4IHNpemUgaXMgZm9yIHRoZSB0dGwgKHVpbnQzMikgYW5kIHJlcXVlc3Rjb3VudCAodWludDMyKS5cbiAqL1xuY29uc3QgTEVBU0VfRklYRURfU0laRSA9IDg7XG5mdW5jdGlvbiBzZXJpYWxpemVMZWFzZUZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBjb25zdCBtZXRhTGVuZ3RoID1cbiAgICBmcmFtZS5tZXRhZGF0YSAhPSBudWxsID8gZW5jb2RlcnMubWV0YWRhdGEuYnl0ZUxlbmd0aChmcmFtZS5tZXRhZGF0YSkgOiAwO1xuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIEZSQU1FX0hFQURFUl9TSVpFICsgTEVBU0VfRklYRURfU0laRSArIG1ldGFMZW5ndGhcbiAgKTtcblxuICBsZXQgb2Zmc2V0ID0gd3JpdGVIZWFkZXIoZnJhbWUsIGJ1ZmZlcik7XG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQzMkJFKGZyYW1lLnR0bCwgb2Zmc2V0KTtcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDMyQkUoZnJhbWUucmVxdWVzdENvdW50LCBvZmZzZXQpO1xuICBpZiAoZnJhbWUubWV0YWRhdGEgIT0gbnVsbCkge1xuICAgIGVuY29kZXJzLm1ldGFkYXRhLmVuY29kZShcbiAgICAgIGZyYW1lLm1ldGFkYXRhLFxuICAgICAgYnVmZmVyLFxuICAgICAgb2Zmc2V0LFxuICAgICAgb2Zmc2V0ICsgbWV0YUxlbmd0aFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mTGVhc2VGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgbWV0YUxlbmd0aCA9XG4gICAgZnJhbWUubWV0YWRhdGEgIT0gbnVsbCA/IGVuY29kZXJzLm1ldGFkYXRhLmJ5dGVMZW5ndGgoZnJhbWUubWV0YWRhdGEpIDogMDtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFICsgTEVBU0VfRklYRURfU0laRSArIG1ldGFMZW5ndGg7XG59XG5cbi8qKlxuICogUmVhZHMgYSBMRUFTRSBmcmFtZSBmcm9tIHRoZSBidWZmZXIgYW5kIHJldHVybnMgaXQuXG4gKi9cbmZ1bmN0aW9uIGRlc2VyaWFsaXplTGVhc2VGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPT09IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIExFQVNFIGZyYW1lLCBleHBlY3RlZCBzdHJlYW0gaWQgdG8gYmUgMC4nXG4gICk7XG5cbiAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgbGV0IG9mZnNldCA9IEZSQU1FX0hFQURFUl9TSVpFO1xuICBjb25zdCB0dGwgPSBidWZmZXIucmVhZFVJbnQzMkJFKG9mZnNldCk7XG4gIG9mZnNldCArPSA0O1xuICBjb25zdCByZXF1ZXN0Q291bnQgPSBidWZmZXIucmVhZFVJbnQzMkJFKG9mZnNldCk7XG4gIG9mZnNldCArPSA0O1xuICBsZXQgbWV0YWRhdGEgPSBudWxsO1xuICBpZiAob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCkge1xuICAgIG1ldGFkYXRhID0gZW5jb2RlcnMubWV0YWRhdGEuZGVjb2RlKGJ1ZmZlciwgb2Zmc2V0LCBidWZmZXIubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtZXRhZGF0YSxcbiAgICByZXF1ZXN0Q291bnQsXG4gICAgc3RyZWFtSWQsXG4gICAgdHRsLFxuICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuTEVBU0UsXG4gIH07XG59XG5cbi8qKlxuICogV3JpdGVzIGEgUkVRVUVTVF9GTkYgb3IgUkVRVUVTVF9SRVNQT05TRSBmcmFtZSB0byBhIG5ldyBidWZmZXIgYW5kIHJldHVybnNcbiAqIGl0LlxuICpcbiAqIE5vdGUgdGhhdCB0aGVzZSBmcmFtZXMgaGF2ZSB0aGUgc2FtZSBzaGFwZSBhbmQgb25seSBkaWZmZXIgaW4gdGhlaXIgdHlwZS5cbiAqL1xuZnVuY3Rpb24gc2VyaWFsaXplUmVxdWVzdEZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBjb25zdCBwYXlsb2FkTGVuZ3RoID0gZ2V0UGF5bG9hZExlbmd0aChmcmFtZSwgZW5jb2RlcnMpO1xuICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgIEZSQU1FX0hFQURFUl9TSVpFICsgcGF5bG9hZExlbmd0aFxuICApO1xuICBjb25zdCBvZmZzZXQgPSB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKTtcbiAgd3JpdGVQYXlsb2FkKGZyYW1lLCBidWZmZXIsIGVuY29kZXJzLCBvZmZzZXQpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5mdW5jdGlvbiBzaXplT2ZSZXF1ZXN0RnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IHBheWxvYWRMZW5ndGggPSBnZXRQYXlsb2FkTGVuZ3RoKGZyYW1lLCBlbmNvZGVycyk7XG4gIHJldHVybiBGUkFNRV9IRUFERVJfU0laRSArIHBheWxvYWRMZW5ndGg7XG59XG5cbi8qKlxuICogV3JpdGVzIGEgTUVUQURBVEFfUFVTSCBmcmFtZSB0byBhIG5ldyBidWZmZXIgYW5kIHJldHVybnNcbiAqIGl0LlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVNZXRhZGF0YVB1c2hGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgbWV0YWRhdGEgPSBmcmFtZS5tZXRhZGF0YTtcbiAgaWYgKG1ldGFkYXRhICE9IG51bGwpIHtcbiAgICBjb25zdCBidWZmZXIgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5jcmVhdGVCdWZmZXIpKFxuICAgICAgRlJBTUVfSEVBREVSX1NJWkUgKyBlbmNvZGVycy5tZXRhZGF0YS5ieXRlTGVuZ3RoKG1ldGFkYXRhKVxuICAgICk7XG5cbiAgICBjb25zdCBvZmZzZXQgPSB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKTtcbiAgICBlbmNvZGVycy5tZXRhZGF0YS5lbmNvZGUobWV0YWRhdGEsIGJ1ZmZlciwgb2Zmc2V0LCBidWZmZXIubGVuZ3RoKTtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoRlJBTUVfSEVBREVSX1NJWkUpO1xuICAgIHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICAgIHJldHVybiBidWZmZXI7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2l6ZU9mTWV0YWRhdGFQdXNoRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIHJldHVybiAoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgK1xuICAgIChmcmFtZS5tZXRhZGF0YSAhPSBudWxsID8gZW5jb2RlcnMubWV0YWRhdGEuYnl0ZUxlbmd0aChmcmFtZS5tZXRhZGF0YSkgOiAwKVxuICApO1xufVxuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVJlcXVlc3RGbmZGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPiAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBSRVFVRVNUX0ZORiBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlID4gMC4nXG4gICk7XG5cbiAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgY29uc3QgZnJhbWUgPSB7XG4gICAgZGF0YTogbnVsbCxcbiAgICBmbGFncyxcbiAgICBsZW5ndGgsXG4gICAgbWV0YWRhdGE6IG51bGwsXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0ZORixcbiAgfTtcblxuICByZWFkUGF5bG9hZChidWZmZXIsIGZyYW1lLCBlbmNvZGVycywgRlJBTUVfSEVBREVSX1NJWkUpO1xuICByZXR1cm4gZnJhbWU7XG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplUmVxdWVzdFJlc3BvbnNlRnJhbWUoYnVmZmVyLCBzdHJlYW1JZCwgZmxhZ3MsIGVuY29kZXJzKSB7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIHN0cmVhbUlkID4gMCxcbiAgICAnUlNvY2tldEJpbmFyeUZyYW1pbmc6IEludmFsaWQgUkVRVUVTVF9SRVNQT05TRSBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlID4gMC4nXG4gICk7XG5cbiAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgY29uc3QgZnJhbWUgPSB7XG4gICAgZGF0YTogbnVsbCxcbiAgICBmbGFncyxcbiAgICBsZW5ndGgsXG4gICAgbWV0YWRhdGE6IG51bGwsXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX1JFU1BPTlNFLFxuICB9O1xuXG4gIHJlYWRQYXlsb2FkKGJ1ZmZlciwgZnJhbWUsIGVuY29kZXJzLCBGUkFNRV9IRUFERVJfU0laRSk7XG4gIHJldHVybiBmcmFtZTtcbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVNZXRhZGF0YVB1c2hGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPT09IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIE1FVEFEQVRBX1BVU0ggZnJhbWUsIGV4cGVjdGVkIHN0cmVhbSBpZCB0byBiZSAwLidcbiAgKTtcblxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICByZXR1cm4ge1xuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtZXRhZGF0YTpcbiAgICAgIGxlbmd0aCA9PT0gRlJBTUVfSEVBREVSX1NJWkVcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogZW5jb2RlcnMubWV0YWRhdGEuZGVjb2RlKGJ1ZmZlciwgRlJBTUVfSEVBREVSX1NJWkUsIGxlbmd0aCksXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5NRVRBREFUQV9QVVNILFxuICB9O1xufVxuXG4vKipcbiAqIFdyaXRlcyBhIFJFUVVFU1RfU1RSRUFNIG9yIFJFUVVFU1RfQ0hBTk5FTCBmcmFtZSB0byBhIG5ldyBidWZmZXIgYW5kIHJldHVybnNcbiAqIGl0LlxuICpcbiAqIE5vdGUgdGhhdCB0aGVzZSBmcmFtZXMgaGF2ZSB0aGUgc2FtZSBzaGFwZSBhbmQgb25seSBkaWZmZXIgaW4gdGhlaXIgdHlwZS5cbiAqXG4gKiBQcmVmaXggc2l6ZSBpcyBmb3IgcmVxdWVzdE4gKHVpbnQzMiA9IDQpLlxuICovXG5jb25zdCBSRVFVRVNUX01BTllfSEVBREVSID0gNDtcbmZ1bmN0aW9uIHNlcmlhbGl6ZVJlcXVlc3RNYW55RnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IHBheWxvYWRMZW5ndGggPSBnZXRQYXlsb2FkTGVuZ3RoKGZyYW1lLCBlbmNvZGVycyk7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgKyBSRVFVRVNUX01BTllfSEVBREVSICsgcGF5bG9hZExlbmd0aFxuICApO1xuXG4gIGxldCBvZmZzZXQgPSB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKTtcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDMyQkUoZnJhbWUucmVxdWVzdE4sIG9mZnNldCk7XG4gIHdyaXRlUGF5bG9hZChmcmFtZSwgYnVmZmVyLCBlbmNvZGVycywgb2Zmc2V0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mUmVxdWVzdE1hbnlGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgcGF5bG9hZExlbmd0aCA9IGdldFBheWxvYWRMZW5ndGgoZnJhbWUsIGVuY29kZXJzKTtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFICsgUkVRVUVTVF9NQU5ZX0hFQURFUiArIHBheWxvYWRMZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplUmVxdWVzdFN0cmVhbUZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycykge1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICBzdHJlYW1JZCA+IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFUVVFU1RfU1RSRUFNIGZyYW1lLCBleHBlY3RlZCBzdHJlYW0gaWQgdG8gYmUgPiAwLidcbiAgKTtcblxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBsZXQgb2Zmc2V0ID0gRlJBTUVfSEVBREVSX1NJWkU7XG4gIGNvbnN0IHJlcXVlc3ROID0gYnVmZmVyLnJlYWRJbnQzMkJFKG9mZnNldCk7XG4gIG9mZnNldCArPSA0O1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICByZXF1ZXN0TiA+IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFUVVFU1RfU1RSRUFNIGZyYW1lLCBleHBlY3RlZCByZXF1ZXN0TiB0byBiZSA+IDAsIGdvdCBgJXNgLicsXG4gICAgcmVxdWVzdE5cbiAgKTtcblxuICBjb25zdCBmcmFtZSA9IHtcbiAgICBkYXRhOiBudWxsLFxuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtZXRhZGF0YTogbnVsbCxcbiAgICByZXF1ZXN0TixcbiAgICBzdHJlYW1JZCxcbiAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfU1RSRUFNLFxuICB9O1xuXG4gIHJlYWRQYXlsb2FkKGJ1ZmZlciwgZnJhbWUsIGVuY29kZXJzLCBvZmZzZXQpO1xuICByZXR1cm4gZnJhbWU7XG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplUmVxdWVzdENoYW5uZWxGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPiAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBSRVFVRVNUX0NIQU5ORUwgZnJhbWUsIGV4cGVjdGVkIHN0cmVhbSBpZCB0byBiZSA+IDAuJ1xuICApO1xuXG4gIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGxldCBvZmZzZXQgPSBGUkFNRV9IRUFERVJfU0laRTtcbiAgY29uc3QgcmVxdWVzdE4gPSBidWZmZXIucmVhZEludDMyQkUob2Zmc2V0KTtcbiAgb2Zmc2V0ICs9IDQ7XG4gICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgIHJlcXVlc3ROID4gMCxcbiAgICAnUlNvY2tldEJpbmFyeUZyYW1pbmc6IEludmFsaWQgUkVRVUVTVF9TVFJFQU0gZnJhbWUsIGV4cGVjdGVkIHJlcXVlc3ROIHRvIGJlID4gMCwgZ290IGAlc2AuJyxcbiAgICByZXF1ZXN0TlxuICApO1xuXG4gIGNvbnN0IGZyYW1lID0ge1xuICAgIGRhdGE6IG51bGwsXG4gICAgZmxhZ3MsXG4gICAgbGVuZ3RoLFxuICAgIG1ldGFkYXRhOiBudWxsLFxuICAgIHJlcXVlc3ROLFxuICAgIHN0cmVhbUlkLFxuICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9DSEFOTkVMLFxuICB9O1xuXG4gIHJlYWRQYXlsb2FkKGJ1ZmZlciwgZnJhbWUsIGVuY29kZXJzLCBvZmZzZXQpO1xuICByZXR1cm4gZnJhbWU7XG59XG5cbi8qKlxuICogV3JpdGVzIGEgUkVRVUVTVF9OIGZyYW1lIHRvIGEgbmV3IGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqXG4gKiBQcmVmaXggc2l6ZSBpcyBmb3IgcmVxdWVzdE4gKHVpbnQzMiA9IDQpLlxuICovXG5jb25zdCBSRVFVRVNUX05fSEVBREVSID0gNDtcbmZ1bmN0aW9uIHNlcmlhbGl6ZVJlcXVlc3RORnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgKyBSRVFVRVNUX05fSEVBREVSXG4gICk7XG4gIGNvbnN0IG9mZnNldCA9IHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICBidWZmZXIud3JpdGVVSW50MzJCRShmcmFtZS5yZXF1ZXN0Tiwgb2Zmc2V0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mUmVxdWVzdE5GcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFICsgUkVRVUVTVF9OX0hFQURFUjtcbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVSZXF1ZXN0TkZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycykge1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICBzdHJlYW1JZCA+IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFUVVFU1RfTiBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlID4gMC4nXG4gICk7XG5cbiAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgY29uc3QgcmVxdWVzdE4gPSBidWZmZXIucmVhZEludDMyQkUoRlJBTUVfSEVBREVSX1NJWkUpO1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICByZXF1ZXN0TiA+IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFUVVFU1RfU1RSRUFNIGZyYW1lLCBleHBlY3RlZCByZXF1ZXN0TiB0byBiZSA+IDAsIGdvdCBgJXNgLicsXG4gICAgcmVxdWVzdE5cbiAgKTtcblxuICByZXR1cm4ge1xuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICByZXF1ZXN0TixcbiAgICBzdHJlYW1JZCxcbiAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTixcbiAgfTtcbn1cblxuLyoqXG4gKiBXcml0ZXMgYSBDQU5DRUwgZnJhbWUgdG8gYSBuZXcgYnVmZmVyIGFuZCByZXR1cm5zIGl0LlxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVDYW5jZWxGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgYnVmZmVyID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMuY3JlYXRlQnVmZmVyKShGUkFNRV9IRUFERVJfU0laRSk7XG4gIHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5mdW5jdGlvbiBzaXplT2ZDYW5jZWxGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFO1xufVxuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZUNhbmNlbEZyYW1lKGJ1ZmZlciwgc3RyZWFtSWQsIGZsYWdzLCBlbmNvZGVycykge1xuICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICBzdHJlYW1JZCA+IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIENBTkNFTCBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlID4gMC4nXG4gICk7XG5cbiAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgcmV0dXJuIHtcbiAgICBmbGFncyxcbiAgICBsZW5ndGgsXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5DQU5DRUwsXG4gIH07XG59XG5cbi8qKlxuICogV3JpdGVzIGEgUEFZTE9BRCBmcmFtZSB0byBhIG5ldyBidWZmZXIgYW5kIHJldHVybnMgaXQuXG4gKi9cbmZ1bmN0aW9uIHNlcmlhbGl6ZVBheWxvYWRGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgcGF5bG9hZExlbmd0aCA9IGdldFBheWxvYWRMZW5ndGgoZnJhbWUsIGVuY29kZXJzKTtcbiAgY29uc3QgYnVmZmVyID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMuY3JlYXRlQnVmZmVyKShcbiAgICBGUkFNRV9IRUFERVJfU0laRSArIHBheWxvYWRMZW5ndGhcbiAgKTtcbiAgY29uc3Qgb2Zmc2V0ID0gd3JpdGVIZWFkZXIoZnJhbWUsIGJ1ZmZlcik7XG4gIHdyaXRlUGF5bG9hZChmcmFtZSwgYnVmZmVyLCBlbmNvZGVycywgb2Zmc2V0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mUGF5bG9hZEZyYW1lKGZyYW1lLCBlbmNvZGVycykge1xuICBjb25zdCBwYXlsb2FkTGVuZ3RoID0gZ2V0UGF5bG9hZExlbmd0aChmcmFtZSwgZW5jb2RlcnMpO1xuICByZXR1cm4gRlJBTUVfSEVBREVSX1NJWkUgKyBwYXlsb2FkTGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBkZXNlcmlhbGl6ZVBheWxvYWRGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPiAwLFxuICAgICdSU29ja2V0QmluYXJ5RnJhbWluZzogSW52YWxpZCBQQVlMT0FEIGZyYW1lLCBleHBlY3RlZCBzdHJlYW0gaWQgdG8gYmUgPiAwLidcbiAgKTtcblxuICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICBjb25zdCBmcmFtZSA9IHtcbiAgICBkYXRhOiBudWxsLFxuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtZXRhZGF0YTogbnVsbCxcbiAgICBzdHJlYW1JZCxcbiAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlBBWUxPQUQsXG4gIH07XG5cbiAgcmVhZFBheWxvYWQoYnVmZmVyLCBmcmFtZSwgZW5jb2RlcnMsIEZSQU1FX0hFQURFUl9TSVpFKTtcbiAgcmV0dXJuIGZyYW1lO1xufVxuXG4vKipcbiAqIFdyaXRlcyBhIFJFU1VNRSBmcmFtZSBpbnRvIGEgbmV3IGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqXG4gKiBGaXhlZCBzaXplIGlzOlxuICogLSBtYWpvciB2ZXJzaW9uICh1aW50MTYgPSAyKVxuICogLSBtaW5vciB2ZXJzaW9uICh1aW50MTYgPSAyKVxuICogLSB0b2tlbiBsZW5ndGggKHVpbnQxNiA9IDIpXG4gKiAtIGNsaWVudCBwb3NpdGlvbiAodWludDY0ID0gOClcbiAqIC0gc2VydmVyIHBvc2l0aW9uICh1aW50NjQgPSA4KVxuICovXG5jb25zdCBSRVNVTUVfRklYRURfU0laRSA9IDIyO1xuZnVuY3Rpb24gc2VyaWFsaXplUmVzdW1lRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IHJlc3VtZVRva2VuTGVuZ3RoID0gZW5jb2RlcnMucmVzdW1lVG9rZW4uYnl0ZUxlbmd0aChmcmFtZS5yZXN1bWVUb2tlbik7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgKyBSRVNVTUVfRklYRURfU0laRSArIHJlc3VtZVRva2VuTGVuZ3RoXG4gICk7XG5cbiAgbGV0IG9mZnNldCA9IHdyaXRlSGVhZGVyKGZyYW1lLCBidWZmZXIpO1xuICBvZmZzZXQgPSBidWZmZXIud3JpdGVVSW50MTZCRShmcmFtZS5tYWpvclZlcnNpb24sIG9mZnNldCk7XG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQxNkJFKGZyYW1lLm1pbm9yVmVyc2lvbiwgb2Zmc2V0KTtcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDE2QkUocmVzdW1lVG9rZW5MZW5ndGgsIG9mZnNldCk7XG4gIG9mZnNldCA9IGVuY29kZXJzLnJlc3VtZVRva2VuLmVuY29kZShcbiAgICBmcmFtZS5yZXN1bWVUb2tlbixcbiAgICBidWZmZXIsXG4gICAgb2Zmc2V0LFxuICAgIG9mZnNldCArIHJlc3VtZVRva2VuTGVuZ3RoXG4gICk7XG5cbiAgb2Zmc2V0ID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMud3JpdGVVSW50NjRCRSkoXG4gICAgYnVmZmVyLFxuICAgIGZyYW1lLnNlcnZlclBvc2l0aW9uLFxuICAgIG9mZnNldFxuICApO1xuICAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQ2NEJFKShidWZmZXIsIGZyYW1lLmNsaWVudFBvc2l0aW9uLCBvZmZzZXQpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5mdW5jdGlvbiBzaXplT2ZSZXN1bWVGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgY29uc3QgcmVzdW1lVG9rZW5MZW5ndGggPSBlbmNvZGVycy5yZXN1bWVUb2tlbi5ieXRlTGVuZ3RoKGZyYW1lLnJlc3VtZVRva2VuKTtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFICsgUkVTVU1FX0ZJWEVEX1NJWkUgKyByZXN1bWVUb2tlbkxlbmd0aDtcbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVSZXN1bWVGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPT09IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFU1VNRSBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlIDAuJ1xuICApO1xuXG4gIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGxldCBvZmZzZXQgPSBGUkFNRV9IRUFERVJfU0laRTtcbiAgY29uc3QgbWFqb3JWZXJzaW9uID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQpO1xuICBvZmZzZXQgKz0gMjtcbiAgY29uc3QgbWlub3JWZXJzaW9uID0gYnVmZmVyLnJlYWRVSW50MTZCRShvZmZzZXQpO1xuICBvZmZzZXQgKz0gMjtcblxuICBjb25zdCByZXN1bWVUb2tlbkxlbmd0aCA9IGJ1ZmZlci5yZWFkSW50MTZCRShvZmZzZXQpO1xuICBvZmZzZXQgKz0gMjtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgcmVzdW1lVG9rZW5MZW5ndGggPj0gMCAmJlxuICAgICAgcmVzdW1lVG9rZW5MZW5ndGggPD0gX1JTb2NrZXRGcmFtZS5NQVhfUkVTVU1FX0xFTkdUSCxcbiAgICAnUlNvY2tldEJpbmFyeUZyYW1pbmc6IEludmFsaWQgU0VUVVAgZnJhbWUsIGV4cGVjdGVkIHJlc3VtZVRva2VuIGxlbmd0aCAnICtcbiAgICAgICd0byBiZSA+PSAwIGFuZCA8PSAlcy4gR290IGAlc2AuJyxcbiAgICBfUlNvY2tldEZyYW1lLk1BWF9SRVNVTUVfTEVOR1RILFxuICAgIHJlc3VtZVRva2VuTGVuZ3RoXG4gICk7XG5cbiAgY29uc3QgcmVzdW1lVG9rZW4gPSBlbmNvZGVycy5yZXN1bWVUb2tlbi5kZWNvZGUoXG4gICAgYnVmZmVyLFxuICAgIG9mZnNldCxcbiAgICBvZmZzZXQgKyByZXN1bWVUb2tlbkxlbmd0aFxuICApO1xuXG4gIG9mZnNldCArPSByZXN1bWVUb2tlbkxlbmd0aDtcbiAgY29uc3Qgc2VydmVyUG9zaXRpb24gPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5yZWFkVUludDY0QkUpKGJ1ZmZlciwgb2Zmc2V0KTtcbiAgb2Zmc2V0ICs9IDg7XG4gIGNvbnN0IGNsaWVudFBvc2l0aW9uID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMucmVhZFVJbnQ2NEJFKShidWZmZXIsIG9mZnNldCk7XG4gIG9mZnNldCArPSA4O1xuICByZXR1cm4ge1xuICAgIGNsaWVudFBvc2l0aW9uLFxuICAgIGZsYWdzLFxuICAgIGxlbmd0aCxcbiAgICBtYWpvclZlcnNpb24sXG4gICAgbWlub3JWZXJzaW9uLFxuICAgIHJlc3VtZVRva2VuLFxuICAgIHNlcnZlclBvc2l0aW9uLFxuICAgIHN0cmVhbUlkLFxuICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FLFxuICB9O1xufVxuXG4vKipcbiAqIFdyaXRlcyBhIFJFU1VNRV9PSyBmcmFtZSBpbnRvIGEgbmV3IGJ1ZmZlciBhbmQgcmV0dXJucyBpdC5cbiAqXG4gKiBGaXhlZCBzaXplIGlzOlxuICogLSBjbGllbnQgcG9zaXRpb24gKHVpbnQ2NCA9IDgpXG4gKi9cbmNvbnN0IFJFU1VNRV9PS19GSVhFRF9TSVpFID0gODtcbmZ1bmN0aW9uIHNlcmlhbGl6ZVJlc3VtZU9rRnJhbWUoZnJhbWUsIGVuY29kZXJzKSB7XG4gIGNvbnN0IGJ1ZmZlciA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoXG4gICAgRlJBTUVfSEVBREVSX1NJWkUgKyBSRVNVTUVfT0tfRklYRURfU0laRVxuICApO1xuICBjb25zdCBvZmZzZXQgPSB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKTtcbiAgKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMud3JpdGVVSW50NjRCRSkoYnVmZmVyLCBmcmFtZS5jbGllbnRQb3NpdGlvbiwgb2Zmc2V0KTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuZnVuY3Rpb24gc2l6ZU9mUmVzdW1lT2tGcmFtZShmcmFtZSwgZW5jb2RlcnMpIHtcbiAgcmV0dXJuIEZSQU1FX0hFQURFUl9TSVpFICsgUkVTVU1FX09LX0ZJWEVEX1NJWkU7XG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplUmVzdW1lT2tGcmFtZShidWZmZXIsIHN0cmVhbUlkLCBmbGFncywgZW5jb2RlcnMpIHtcbiAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgc3RyZWFtSWQgPT09IDAsXG4gICAgJ1JTb2NrZXRCaW5hcnlGcmFtaW5nOiBJbnZhbGlkIFJFU1VNRSBmcmFtZSwgZXhwZWN0ZWQgc3RyZWFtIGlkIHRvIGJlIDAuJ1xuICApO1xuXG4gIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gIGNvbnN0IGNsaWVudFBvc2l0aW9uID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMucmVhZFVJbnQ2NEJFKShcbiAgICBidWZmZXIsXG4gICAgRlJBTUVfSEVBREVSX1NJWkVcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICBjbGllbnRQb3NpdGlvbixcbiAgICBmbGFncyxcbiAgICBsZW5ndGgsXG4gICAgc3RyZWFtSWQsXG4gICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVNVTUVfT0ssXG4gIH07XG59XG5cbi8qKlxuICogV3JpdGUgdGhlIGhlYWRlciBvZiB0aGUgZnJhbWUgaW50byB0aGUgYnVmZmVyLlxuICovXG5mdW5jdGlvbiB3cml0ZUhlYWRlcihmcmFtZSwgYnVmZmVyKSB7XG4gIGNvbnN0IG9mZnNldCA9IGJ1ZmZlci53cml0ZUludDMyQkUoZnJhbWUuc3RyZWFtSWQsIDApO1xuICAvLyBzaGlmdCBmcmFtZSB0byBoaWdoIDYgYml0cywgZXh0cmFjdCBsb3dlc3QgMTAgYml0cyBmcm9tIGZsYWdzXG4gIHJldHVybiBidWZmZXIud3JpdGVVSW50MTZCRShcbiAgICAoZnJhbWUudHlwZSA8PCBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVfT0ZGRlNFVCkgfFxuICAgICAgKGZyYW1lLmZsYWdzICYgX1JTb2NrZXRGcmFtZS5GTEFHU19NQVNLKSxcbiAgICBvZmZzZXRcbiAgKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgdGhlIGxlbmd0aCBvZiB0aGUgcGF5bG9hZCBzZWN0aW9uIG9mIGEgZnJhbWUuIE9ubHkgYXBwbGllcyB0b1xuICogZnJhbWUgdHlwZXMgdGhhdCBNQVkgaGF2ZSBib3RoIG1ldGFkYXRhIGFuZCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRQYXlsb2FkTGVuZ3RoKGZyYW1lLCBlbmNvZGVycykge1xuICBsZXQgcGF5bG9hZExlbmd0aCA9IDA7XG4gIGlmIChmcmFtZS5kYXRhICE9IG51bGwpIHtcbiAgICBwYXlsb2FkTGVuZ3RoICs9IGVuY29kZXJzLmRhdGEuYnl0ZUxlbmd0aChmcmFtZS5kYXRhKTtcbiAgfVxuICBpZiAoKDAsIF9SU29ja2V0RnJhbWUuaXNNZXRhZGF0YSkoZnJhbWUuZmxhZ3MpKSB7XG4gICAgcGF5bG9hZExlbmd0aCArPSBVSU5UMjRfU0laRTtcbiAgICBpZiAoZnJhbWUubWV0YWRhdGEgIT0gbnVsbCkge1xuICAgICAgcGF5bG9hZExlbmd0aCArPSBlbmNvZGVycy5tZXRhZGF0YS5ieXRlTGVuZ3RoKGZyYW1lLm1ldGFkYXRhKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBheWxvYWRMZW5ndGg7XG59XG5cbi8qKlxuICogV3JpdGUgdGhlIHBheWxvYWQgb2YgYSBmcmFtZSBpbnRvIHRoZSBnaXZlbiBidWZmZXIuIE9ubHkgYXBwbGllcyB0byBmcmFtZVxuICogdHlwZXMgdGhhdCBNQVkgaGF2ZSBib3RoIG1ldGFkYXRhIGFuZCBkYXRhLlxuICovXG5mdW5jdGlvbiB3cml0ZVBheWxvYWQoZnJhbWUsIGJ1ZmZlciwgZW5jb2RlcnMsIG9mZnNldCkge1xuICBpZiAoKDAsIF9SU29ja2V0RnJhbWUuaXNNZXRhZGF0YSkoZnJhbWUuZmxhZ3MpKSB7XG4gICAgaWYgKGZyYW1lLm1ldGFkYXRhICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG1ldGFMZW5ndGggPSBlbmNvZGVycy5tZXRhZGF0YS5ieXRlTGVuZ3RoKGZyYW1lLm1ldGFkYXRhKTtcbiAgICAgIG9mZnNldCA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLndyaXRlVUludDI0QkUpKFxuICAgICAgICBidWZmZXIsXG4gICAgICAgIG1ldGFMZW5ndGgsXG4gICAgICAgIG9mZnNldFxuICAgICAgKTtcbiAgICAgIG9mZnNldCA9IGVuY29kZXJzLm1ldGFkYXRhLmVuY29kZShcbiAgICAgICAgZnJhbWUubWV0YWRhdGEsXG4gICAgICAgIGJ1ZmZlcixcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBvZmZzZXQgKyBtZXRhTGVuZ3RoXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBvZmZzZXQgPSAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQyNEJFKShidWZmZXIsIDAsIG9mZnNldCk7XG4gICAgfVxuICB9XG4gIGlmIChmcmFtZS5kYXRhICE9IG51bGwpIHtcbiAgICBlbmNvZGVycy5kYXRhLmVuY29kZShmcmFtZS5kYXRhLCBidWZmZXIsIG9mZnNldCwgYnVmZmVyLmxlbmd0aCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZWFkIHRoZSBwYXlsb2FkIGZyb20gYSBidWZmZXIgYW5kIHdyaXRlIGl0IGludG8gdGhlIGZyYW1lLiBPbmx5IGFwcGxpZXMgdG9cbiAqIGZyYW1lIHR5cGVzIHRoYXQgTUFZIGhhdmUgYm90aCBtZXRhZGF0YSBhbmQgZGF0YS5cbiAqL1xuZnVuY3Rpb24gcmVhZFBheWxvYWQoYnVmZmVyLCBmcmFtZSwgZW5jb2RlcnMsIG9mZnNldCkge1xuICBpZiAoKDAsIF9SU29ja2V0RnJhbWUuaXNNZXRhZGF0YSkoZnJhbWUuZmxhZ3MpKSB7XG4gICAgY29uc3QgbWV0YUxlbmd0aCA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLnJlYWRVSW50MjRCRSkoYnVmZmVyLCBvZmZzZXQpO1xuICAgIG9mZnNldCArPSBVSU5UMjRfU0laRTtcbiAgICBpZiAobWV0YUxlbmd0aCA+IDApIHtcbiAgICAgIGZyYW1lLm1ldGFkYXRhID0gZW5jb2RlcnMubWV0YWRhdGEuZGVjb2RlKFxuICAgICAgICBidWZmZXIsXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgb2Zmc2V0ICsgbWV0YUxlbmd0aFxuICAgICAgKTtcblxuICAgICAgb2Zmc2V0ICs9IG1ldGFMZW5ndGg7XG4gICAgfVxuICB9XG4gIGlmIChvZmZzZXQgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgZnJhbWUuZGF0YSA9IGVuY29kZXJzLmRhdGEuZGVjb2RlKGJ1ZmZlciwgb2Zmc2V0LCBidWZmZXIubGVuZ3RoKTtcbiAgfVxufVxuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50LWRpc2FibGUgbm8tYml0d2lzZSAqLyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlLFxufSk7XG5leHBvcnRzLnJlYWRVSW50MjRCRSA9IHJlYWRVSW50MjRCRTtcbmV4cG9ydHMud3JpdGVVSW50MjRCRSA9IHdyaXRlVUludDI0QkU7XG5leHBvcnRzLnJlYWRVSW50NjRCRSA9IHJlYWRVSW50NjRCRTtcbmV4cG9ydHMud3JpdGVVSW50NjRCRSA9IHdyaXRlVUludDY0QkU7XG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoO1xuZXhwb3J0cy5jcmVhdGVCdWZmZXIgPSBleHBvcnRzLnRvQnVmZmVyID0gdm9pZCAwO1xuXG52YXIgX0xpdGVCdWZmZXIgPSByZXF1aXJlKCcuL0xpdGVCdWZmZXInKTtcblxuLyoqXG4gKiBNaW1pbXVtIHZhbHVlIHRoYXQgd291bGQgb3ZlcmZsb3cgYml0d2lzZSBvcGVyYXRvcnMgKDJeMzIpLlxuICovXG5jb25zdCBCSVRXSVNFX09WRVJGTE9XID0gMHgxMDAwMDAwMDA7XG5cbi8qKlxuICogUmVhZCBhIHVpbnQyNCBmcm9tIGEgYnVmZmVyIHN0YXJ0aW5nIGF0IHRoZSBnaXZlbiBvZmZzZXQuXG4gKi9cbmZ1bmN0aW9uIHJlYWRVSW50MjRCRShidWZmZXIsIG9mZnNldCkge1xuICBjb25zdCB2YWwxID0gYnVmZmVyLnJlYWRVSW50OChvZmZzZXQpIDw8IDE2O1xuICBjb25zdCB2YWwyID0gYnVmZmVyLnJlYWRVSW50OChvZmZzZXQgKyAxKSA8PCA4O1xuICBjb25zdCB2YWwzID0gYnVmZmVyLnJlYWRVSW50OChvZmZzZXQgKyAyKTtcbiAgcmV0dXJuIHZhbDEgfCB2YWwyIHwgdmFsMztcbn1cblxuLyoqXG4gKiBXcml0ZXMgYSB1aW50MjQgdG8gYSBidWZmZXIgc3RhcnRpbmcgYXQgdGhlIGdpdmVuIG9mZnNldCwgcmV0dXJuaW5nIHRoZVxuICogb2Zmc2V0IG9mIHRoZSBuZXh0IGJ5dGUuXG4gKi9cbmZ1bmN0aW9uIHdyaXRlVUludDI0QkUoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0KSB7XG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQ4KHZhbHVlID4+PiAxNiwgb2Zmc2V0KTsgLy8gM3JkIGJ5dGVcbiAgb2Zmc2V0ID0gYnVmZmVyLndyaXRlVUludDgoKHZhbHVlID4+PiA4KSAmIDB4ZmYsIG9mZnNldCk7IC8vIDJuZCBieXRlXG4gIHJldHVybiBidWZmZXIud3JpdGVVSW50OCh2YWx1ZSAmIDB4ZmYsIG9mZnNldCk7IC8vIDFzdCBieXRlXG59XG5cbi8qKlxuICogUmVhZCBhIHVpbnQ2NCAodGVjaG5pY2FsbHkgc3VwcG9ydHMgdXAgdG8gNTMgYml0cyBwZXIgSlMgbnVtYmVyXG4gKiByZXByZXNlbnRhdGlvbikuXG4gKi9cbmZ1bmN0aW9uIHJlYWRVSW50NjRCRShidWZmZXIsIG9mZnNldCkge1xuICBjb25zdCBoaWdoID0gYnVmZmVyLnJlYWRVSW50MzJCRShvZmZzZXQpO1xuICBjb25zdCBsb3cgPSBidWZmZXIucmVhZFVJbnQzMkJFKG9mZnNldCArIDQpO1xuICByZXR1cm4gaGlnaCAqIEJJVFdJU0VfT1ZFUkZMT1cgKyBsb3c7XG59XG5cbi8qKlxuICogV3JpdGUgYSB1aW50NjQgKHRlY2huaWNhbGx5IHN1cHBvcnRzIHVwIHRvIDUzIGJpdHMgcGVyIEpTIG51bWJlclxuICogcmVwcmVzZW50YXRpb24pLlxuICovXG5mdW5jdGlvbiB3cml0ZVVJbnQ2NEJFKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCkge1xuICBjb25zdCBoaWdoID0gKHZhbHVlIC8gQklUV0lTRV9PVkVSRkxPVykgfCAwO1xuICBjb25zdCBsb3cgPSB2YWx1ZSAlIEJJVFdJU0VfT1ZFUkZMT1c7XG4gIG9mZnNldCA9IGJ1ZmZlci53cml0ZVVJbnQzMkJFKGhpZ2gsIG9mZnNldCk7IC8vIGZpcnN0IGhhbGYgb2YgdWludDY0XG4gIHJldHVybiBidWZmZXIud3JpdGVVSW50MzJCRShsb3csIG9mZnNldCk7IC8vIHNlY29uZCBoYWxmIG9mIHVpbnQ2NFxufVxuXG4vKipcbiAqIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGJ5dGVzIGl0IHdvdWxkIHRha2UgdG8gZW5jb2RlIHRoZSBnaXZlbiBkYXRhIHdpdGggdGhlXG4gKiBnaXZlbiBlbmNvZGluZy5cbiAqL1xuZnVuY3Rpb24gYnl0ZUxlbmd0aChkYXRhLCBlbmNvZGluZykge1xuICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgcmV0dXJuIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIuYnl0ZUxlbmd0aChkYXRhLCBlbmNvZGluZyk7XG59XG5cbi8qKlxuICogQXR0ZW1wdHMgdG8gY29uc3RydWN0IGEgYnVmZmVyIGZyb20gdGhlIGlucHV0LCB0aHJvd3MgaWYgaW52YWxpZC5cbiAqL1xuY29uc3QgdG9CdWZmZXIgPVxuICB0eXBlb2YgX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5mcm9tID09PSAnZnVuY3Rpb24nXG4gICAgPyAoLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBCdWZmZXIuZnJvbShidWZmZXIpIGNvcGllcyB3aGljaCB3ZSBkb24ndCB3YW50IGhlcmVcbiAgICAgICAgaWYgKGFyZ3NbMF0gaW5zdGFuY2VvZiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIuZnJvbS5hcHBseShfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLCBhcmdzKTtcbiAgICAgIH1cbiAgICA6ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIC8vIEJ1ZmZlci5mcm9tKGJ1ZmZlcikgY29waWVzIHdoaWNoIHdlIGRvbid0IHdhbnQgaGVyZVxuICAgICAgICBpZiAoYXJnc1swXSBpbnN0YW5jZW9mIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gYXJnc1swXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IChfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmJpbmQuYXBwbHkoX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlciwgW1xuICAgICAgICAgIF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIsXG4gICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgXSkpKCk7XG4gICAgICB9O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGJ1ZmZlciBvZiBhIGdpdmVuIHNpemVkIGZpbGxlZCB3aXRoIHplcm9zLlxuICovIGV4cG9ydHMudG9CdWZmZXIgPSB0b0J1ZmZlcjtcbmNvbnN0IGNyZWF0ZUJ1ZmZlciA9XG4gIHR5cGVvZiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmFsbG9jID09PSAnZnVuY3Rpb24nXG4gICAgPyAobGVuZ3RoKSA9PiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmFsbG9jKGxlbmd0aClcbiAgICA6IC8vICRGbG93Rml4TWVcbiAgICAgIChsZW5ndGgpID0+IG5ldyBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyKGxlbmd0aCkuZmlsbCgwKTtcbmV4cG9ydHMuY3JlYXRlQnVmZmVyID0gY3JlYXRlQnVmZmVyO1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX3Jzb2NrZXRGbG93YWJsZSA9IHJlcXVpcmUoJ3Jzb2NrZXQtZmxvd2FibGUnKTtcbnZhciBfSW52YXJpYW50ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL0ludmFyaWFudCcpKTtcbnZhciBfUlNvY2tldEZyYW1lID0gcmVxdWlyZSgnLi9SU29ja2V0RnJhbWUnKTtcbnZhciBfUlNvY2tldFZlcnNpb24gPSByZXF1aXJlKCcuL1JTb2NrZXRWZXJzaW9uJyk7XG52YXIgX1JTb2NrZXRNYWNoaW5lID0gcmVxdWlyZSgnLi9SU29ja2V0TWFjaGluZScpO1xudmFyIF9SU29ja2V0TGVhc2UgPSByZXF1aXJlKCcuL1JTb2NrZXRMZWFzZScpO1xuXG52YXIgX1JTb2NrZXRTZXJpYWxpemF0aW9uID0gcmVxdWlyZSgnLi9SU29ja2V0U2VyaWFsaXphdGlvbicpO1xudmFyIF9SZWFzc2VtYmx5RHVwbGV4Q29ubmVjdGlvbiA9IHJlcXVpcmUoJy4vUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb24nKTtcbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cblxuLyoqXG4gKiBSU29ja2V0Q2xpZW50OiBBIGNsaWVudCBpbiBhbiBSU29ja2V0IGNvbm5lY3Rpb24gdGhhdCB3aWxsIGNvbW11bmljYXRlcyB3aXRoXG4gKiB0aGUgcGVlciB2aWEgdGhlIGdpdmVuIHRyYW5zcG9ydCBjbGllbnQuIFByb3ZpZGVzIG1ldGhvZHMgZm9yIGVzdGFibGlzaGluZyBhXG4gKiBjb25uZWN0aW9uIGFuZCBpbml0aWF0aW5nIHRoZSBSU29ja2V0IGludGVyYWN0aW9uczpcbiAqIC0gZmlyZUFuZEZvcmdldCgpXG4gKiAtIHJlcXVlc3RSZXNwb25zZSgpXG4gKiAtIHJlcXVlc3RTdHJlYW0oKVxuICogLSByZXF1ZXN0Q2hhbm5lbCgpXG4gKiAtIG1ldGFkYXRhUHVzaCgpXG4gKi9cbmNsYXNzIFJTb2NrZXRDbGllbnQge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICB0aGlzLl9jaGVja0NvbmZpZyhjb25maWcpO1xuICAgIHRoaXMuX2NhbmNlbCA9IG51bGw7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9jb25maWcudHJhbnNwb3J0LmNsb3NlKCk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgIXRoaXMuX2Nvbm5lY3Rpb24sXG4gICAgICAnUlNvY2tldENsaWVudDogVW5leHBlY3RlZCBjYWxsIHRvIGNvbm5lY3QoKSwgYWxyZWFkeSBjb25uZWN0ZWQuJ1xuICAgICk7XG5cbiAgICB0aGlzLl9jb25uZWN0aW9uID0gbmV3IF9yc29ja2V0Rmxvd2FibGUuU2luZ2xlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBjb25zdCB0cmFuc3BvcnQgPSB0aGlzLl9jb25maWcudHJhbnNwb3J0O1xuICAgICAgbGV0IHN1YnNjcmlwdGlvbjtcbiAgICAgIHRyYW5zcG9ydC5jb25uZWN0aW9uU3RhdHVzKCkuc3Vic2NyaWJlKHtcbiAgICAgICAgb25OZXh0OiAoc3RhdHVzKSA9PiB7XG4gICAgICAgICAgaWYgKHN0YXR1cy5raW5kID09PSAnQ09OTkVDVEVEJykge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uICYmIHN1YnNjcmlwdGlvbi5jYW5jZWwoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25Db21wbGV0ZShcbiAgICAgICAgICAgICAgbmV3IFJTb2NrZXRDbGllbnRTb2NrZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5fY29uZmlnLFxuICAgICAgICAgICAgICAgIG5ldyBfUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb24uUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb24oXG4gICAgICAgICAgICAgICAgICB0cmFuc3BvcnRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0dXMua2luZCA9PT0gJ0VSUk9SJykge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9uICYmIHN1YnNjcmlwdGlvbi5jYW5jZWwoKTtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25FcnJvcihzdGF0dXMuZXJyb3IpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzLmtpbmQgPT09ICdDTE9TRUQnKSB7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb24gJiYgc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgICAgICAgICAgc3Vic2NyaWJlci5vbkVycm9yKG5ldyBFcnJvcignUlNvY2tldENsaWVudDogQ29ubmVjdGlvbiBjbG9zZWQuJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25TdWJzY3JpYmU6IChfc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uID0gX3N1YnNjcmlwdGlvbjtcbiAgICAgICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIF9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICAgICAgICB0cmFuc3BvcnQuY2xvc2UoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgdHJhbnNwb3J0LmNvbm5lY3QoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdGlvbjtcbiAgfVxuXG4gIF9jaGVja0NvbmZpZyhjb25maWcpIHtcbiAgICBjb25zdCBzZXR1cCA9IGNvbmZpZy5zZXR1cDtcbiAgICBjb25zdCBrZWVwQWxpdmUgPSBzZXR1cCAmJiBzZXR1cC5rZWVwQWxpdmU7XG4gICAgLy8gd3JhcCBpbiB0cnkgY2F0Y2ggc2luY2UgaW4gJ3N0cmljdCcgbW9kZSB0aGUgYWNjZXNzIHRvIGFuIHVuZXhjaXRpbmcgd2luZG93IHdpbGwgdGhyb3dcbiAgICAvLyB0aGUgUmVmZXJlbmNlRXJyb3I6IHdpbmRvdyBpcyBub3QgZGVmaW5lZCBleGNlcHRpb25cbiAgICB0cnkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBjb25zdCBuYXZpZ2F0b3IgPSB3aW5kb3cgJiYgd2luZG93Lm5hdmlnYXRvcjtcbiAgICAgIGlmIChcbiAgICAgICAga2VlcEFsaXZlID4gMzAwMDAgJiZcbiAgICAgICAgbmF2aWdhdG9yICYmXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQgJiZcbiAgICAgICAgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ1RyaWRlbnQnKSB8fFxuICAgICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ0VkZycpKVxuICAgICAgKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAncnNvY2tldC1qczogRHVlIHRvIGEgYnJvd3NlciBidWcsIEludGVybmV0IEV4cGxvcmVyIGFuZCBFZGdlIHVzZXJzIG1heSBleHBlcmllbmNlIFdlYlNvY2tldCBpbnN0YWJpbGl0eSB3aXRoIGtlZXBBbGl2ZSB2YWx1ZXMgbG9uZ2VyIHRoYW4gMzAgc2Vjb25kcy4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gaWdub3JlIHRoZSBlcnJvciBzaW5jZSBpdCBtZWFucyB0aGF0IHRoZSBjb2RlIGlzIHJ1bm5pbmcgaW4gbm9uIGJyb3dzZXIgZW52aXJvbm1lbnRcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAcHJpdmF0ZVxuICovIGV4cG9ydHMuZGVmYXVsdCA9IFJTb2NrZXRDbGllbnQ7XG5jbGFzcyBSU29ja2V0Q2xpZW50U29ja2V0IHtcbiAgY29uc3RydWN0b3IoY29uZmlnLCBjb25uZWN0aW9uKSB7XG4gICAgbGV0IHJlcXVlc3RlckxlYXNlSGFuZGxlcjtcbiAgICBsZXQgcmVzcG9uZGVyTGVhc2VIYW5kbGVyO1xuXG4gICAgY29uc3QgbGVhc2VzU3VwcGxpZXIgPSBjb25maWcubGVhc2VzO1xuICAgIGlmIChsZWFzZXNTdXBwbGllcikge1xuICAgICAgY29uc3QgbGVhc2UgPSBsZWFzZXNTdXBwbGllcigpO1xuICAgICAgcmVxdWVzdGVyTGVhc2VIYW5kbGVyID0gbmV3IF9SU29ja2V0TGVhc2UuUmVxdWVzdGVyTGVhc2VIYW5kbGVyKFxuICAgICAgICBsZWFzZS5fcmVjZWl2ZXJcbiAgICAgICk7XG4gICAgICByZXNwb25kZXJMZWFzZUhhbmRsZXIgPSBuZXcgX1JTb2NrZXRMZWFzZS5SZXNwb25kZXJMZWFzZUhhbmRsZXIoXG4gICAgICAgIGxlYXNlLl9zZW5kZXIsXG4gICAgICAgIGxlYXNlLl9zdGF0c1xuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3Qge2tlZXBBbGl2ZSwgbGlmZXRpbWV9ID0gY29uZmlnLnNldHVwO1xuXG4gICAgdGhpcy5fbWFjaGluZSA9ICgwLCBfUlNvY2tldE1hY2hpbmUuY3JlYXRlQ2xpZW50TWFjaGluZSkoXG4gICAgICBjb25uZWN0aW9uLFxuICAgICAgKHN1YnNjcmliZXIpID0+IGNvbm5lY3Rpb24ucmVjZWl2ZSgpLnN1YnNjcmliZShzdWJzY3JpYmVyKSxcbiAgICAgIGxpZmV0aW1lLFxuICAgICAgY29uZmlnLnNlcmlhbGl6ZXJzLFxuICAgICAgY29uZmlnLnJlc3BvbmRlcixcbiAgICAgIGNvbmZpZy5lcnJvckhhbmRsZXIsXG4gICAgICByZXF1ZXN0ZXJMZWFzZUhhbmRsZXIsXG4gICAgICByZXNwb25kZXJMZWFzZUhhbmRsZXJcbiAgICApO1xuXG4gICAgLy8gU2VuZCBTRVRVUFxuICAgIGNvbm5lY3Rpb24uc2VuZE9uZSh0aGlzLl9idWlsZFNldHVwRnJhbWUoY29uZmlnKSk7XG5cbiAgICAvLyBTZW5kIEtFRVBBTElWRSBmcmFtZXNcbiAgICBjb25zdCBrZWVwQWxpdmVGcmFtZXMgPSAoMCwgX3Jzb2NrZXRGbG93YWJsZS5ldmVyeSkoa2VlcEFsaXZlKS5tYXAoKCkgPT4gKHtcbiAgICAgIGRhdGE6IG51bGwsXG4gICAgICBmbGFnczogX1JTb2NrZXRGcmFtZS5GTEFHUy5SRVNQT05ELFxuICAgICAgbGFzdFJlY2VpdmVkUG9zaXRpb246IDAsXG4gICAgICBzdHJlYW1JZDogX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRCxcbiAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuS0VFUEFMSVZFLFxuICAgIH0pKTtcblxuICAgIGNvbm5lY3Rpb24uc2VuZChrZWVwQWxpdmVGcmFtZXMpO1xuICB9XG5cbiAgZmlyZUFuZEZvcmdldChwYXlsb2FkKSB7XG4gICAgdGhpcy5fbWFjaGluZS5maXJlQW5kRm9yZ2V0KHBheWxvYWQpO1xuICB9XG5cbiAgcmVxdWVzdFJlc3BvbnNlKHBheWxvYWQpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFjaGluZS5yZXF1ZXN0UmVzcG9uc2UocGF5bG9hZCk7XG4gIH1cblxuICByZXF1ZXN0U3RyZWFtKHBheWxvYWQpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFjaGluZS5yZXF1ZXN0U3RyZWFtKHBheWxvYWQpO1xuICB9XG5cbiAgcmVxdWVzdENoYW5uZWwocGF5bG9hZHMpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFjaGluZS5yZXF1ZXN0Q2hhbm5lbChwYXlsb2Fkcyk7XG4gIH1cblxuICBtZXRhZGF0YVB1c2gocGF5bG9hZCkge1xuICAgIHJldHVybiB0aGlzLl9tYWNoaW5lLm1ldGFkYXRhUHVzaChwYXlsb2FkKTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX21hY2hpbmUuY2xvc2UoKTtcbiAgfVxuXG4gIGNvbm5lY3Rpb25TdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hY2hpbmUuY29ubmVjdGlvblN0YXR1cygpO1xuICB9XG5cbiAgYXZhaWxhYmlsaXR5KCkge1xuICAgIHJldHVybiB0aGlzLl9tYWNoaW5lLmF2YWlsYWJpbGl0eSgpO1xuICB9XG5cbiAgX2J1aWxkU2V0dXBGcmFtZShjb25maWcpIHtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhTWltZVR5cGUsXG4gICAgICBrZWVwQWxpdmUsXG4gICAgICBsaWZldGltZSxcbiAgICAgIG1ldGFkYXRhTWltZVR5cGUsXG4gICAgICBwYXlsb2FkLFxuICAgIH0gPSBjb25maWcuc2V0dXA7XG5cbiAgICBjb25zdCBzZXJpYWxpemVycyA9XG4gICAgICBjb25maWcuc2VyaWFsaXplcnMgfHwgX1JTb2NrZXRTZXJpYWxpemF0aW9uLklkZW50aXR5U2VyaWFsaXplcnM7XG4gICAgY29uc3QgZGF0YSA9IHBheWxvYWQgPyBzZXJpYWxpemVycy5kYXRhLnNlcmlhbGl6ZShwYXlsb2FkLmRhdGEpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG1ldGFkYXRhID0gcGF5bG9hZFxuICAgICAgPyBzZXJpYWxpemVycy5tZXRhZGF0YS5zZXJpYWxpemUocGF5bG9hZC5tZXRhZGF0YSlcbiAgICAgIDogdW5kZWZpbmVkO1xuICAgIGxldCBmbGFncyA9IDA7XG4gICAgaWYgKG1ldGFkYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZsYWdzIHw9IF9SU29ja2V0RnJhbWUuRkxBR1MuTUVUQURBVEE7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkYXRhLFxuICAgICAgZGF0YU1pbWVUeXBlLFxuICAgICAgZmxhZ3M6IGZsYWdzIHwgKGNvbmZpZy5sZWFzZXMgPyBfUlNvY2tldEZyYW1lLkZMQUdTLkxFQVNFIDogMCksXG4gICAgICBrZWVwQWxpdmUsXG4gICAgICBsaWZldGltZSxcbiAgICAgIG1ham9yVmVyc2lvbjogX1JTb2NrZXRWZXJzaW9uLk1BSk9SX1ZFUlNJT04sXG4gICAgICBtZXRhZGF0YSxcbiAgICAgIG1ldGFkYXRhTWltZVR5cGUsXG4gICAgICBtaW5vclZlcnNpb246IF9SU29ja2V0VmVyc2lvbi5NSU5PUl9WRVJTSU9OLFxuICAgICAgcmVzdW1lVG9rZW46IG51bGwsXG4gICAgICBzdHJlYW1JZDogX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRCxcbiAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuU0VUVVAsXG4gICAgfTtcbiAgfVxufVxuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5CdWZmZXJFbmNvZGVycyA9IGV4cG9ydHMuVXRmOEVuY29kZXJzID0gZXhwb3J0cy5CdWZmZXJFbmNvZGVyID0gZXhwb3J0cy5VVEY4RW5jb2RlciA9IHZvaWQgMDtcblxudmFyIF9SU29ja2V0QnVmZmVyVXRpbHMgPSByZXF1aXJlKCcuL1JTb2NrZXRCdWZmZXJVdGlscycpO1xudmFyIF9JbnZhcmlhbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoJy4vSW52YXJpYW50JykpO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuXG5jb25zdCBVVEY4RW5jb2RlciA9IHtcbiAgYnl0ZUxlbmd0aDogKHZhbHVlKSA9PiAoMCwgX1JTb2NrZXRCdWZmZXJVdGlscy5ieXRlTGVuZ3RoKSh2YWx1ZSwgJ3V0ZjgnKSxcbiAgZGVjb2RlOiAoYnVmZmVyLCBzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIGJ1ZmZlci50b1N0cmluZygndXRmOCcsIHN0YXJ0LCBlbmQpO1xuICB9LFxuICBlbmNvZGU6ICh2YWx1ZSwgYnVmZmVyLCBzdGFydCwgZW5kKSA9PiB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnLFxuICAgICAgJ1JTb2NrZXRFbmNvZGluZzogRXhwZWN0ZWQgdmFsdWUgdG8gYmUgYSBzdHJpbmcsIGdvdCBgJXNgLicsXG4gICAgICB2YWx1ZVxuICAgICk7XG5cbiAgICBidWZmZXIud3JpdGUodmFsdWUsIHN0YXJ0LCBlbmQgLSBzdGFydCwgJ3V0ZjgnKTtcbiAgICByZXR1cm4gZW5kO1xuICB9LFxufTtcbmV4cG9ydHMuVVRGOEVuY29kZXIgPSBVVEY4RW5jb2RlcjtcblxuY29uc3QgQnVmZmVyRW5jb2RlciA9IHtcbiAgYnl0ZUxlbmd0aDogKHZhbHVlKSA9PiB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICBCdWZmZXIuaXNCdWZmZXIodmFsdWUpLFxuICAgICAgJ1JTb2NrZXRFbmNvZGluZzogRXhwZWN0ZWQgdmFsdWUgdG8gYmUgYSBidWZmZXIsIGdvdCBgJXNgLicsXG4gICAgICB2YWx1ZVxuICAgICk7XG5cbiAgICByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICB9LFxuICBkZWNvZGU6IChidWZmZXIsIHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICB9LFxuICBlbmNvZGU6ICh2YWx1ZSwgYnVmZmVyLCBzdGFydCwgZW5kKSA9PiB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICBCdWZmZXIuaXNCdWZmZXIodmFsdWUpLFxuICAgICAgJ1JTb2NrZXRFbmNvZGluZzogRXhwZWN0ZWQgdmFsdWUgdG8gYmUgYSBidWZmZXIsIGdvdCBgJXNgLicsXG4gICAgICB2YWx1ZVxuICAgICk7XG5cbiAgICB2YWx1ZS5jb3B5KGJ1ZmZlciwgc3RhcnQsIDAsIHZhbHVlLmxlbmd0aCk7XG4gICAgcmV0dXJuIGVuZDtcbiAgfSxcbn07XG5cbi8qKlxuICogRW5jb2RlIGFsbCB2YWx1ZXMgYXMgVVRGOCBzdHJpbmdzLlxuICovIGV4cG9ydHMuQnVmZmVyRW5jb2RlciA9IEJ1ZmZlckVuY29kZXI7XG5jb25zdCBVdGY4RW5jb2RlcnMgPSB7XG4gIGRhdGE6IFVURjhFbmNvZGVyLFxuICBkYXRhTWltZVR5cGU6IFVURjhFbmNvZGVyLFxuICBtZXNzYWdlOiBVVEY4RW5jb2RlcixcbiAgbWV0YWRhdGE6IFVURjhFbmNvZGVyLFxuICBtZXRhZGF0YU1pbWVUeXBlOiBVVEY4RW5jb2RlcixcbiAgcmVzdW1lVG9rZW46IFVURjhFbmNvZGVyLFxufTtcblxuLyoqXG4gKiBFbmNvZGUgYWxsIHZhbHVlcyBhcyBidWZmZXJzLlxuICovIGV4cG9ydHMuVXRmOEVuY29kZXJzID0gVXRmOEVuY29kZXJzO1xuY29uc3QgQnVmZmVyRW5jb2RlcnMgPSB7XG4gIGRhdGE6IEJ1ZmZlckVuY29kZXIsXG4gIGRhdGFNaW1lVHlwZTogVVRGOEVuY29kZXIsXG4gIG1lc3NhZ2U6IFVURjhFbmNvZGVyLFxuICBtZXRhZGF0YTogQnVmZmVyRW5jb2RlcixcbiAgbWV0YWRhdGFNaW1lVHlwZTogVVRGOEVuY29kZXIsXG4gIHJlc3VtZVRva2VuOiBCdWZmZXJFbmNvZGVyLFxufTtcbmV4cG9ydHMuQnVmZmVyRW5jb2RlcnMgPSBCdWZmZXJFbmNvZGVycztcbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuLCBuby1iaXR3aXNlICovIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgZXhwb3J0cyxcbiAgJ19fZXNNb2R1bGUnLFxuICB7dmFsdWU6IHRydWV9XG4pO1xuZXhwb3J0cy5pc0lnbm9yZSA9IGlzSWdub3JlO1xuZXhwb3J0cy5pc01ldGFkYXRhID0gaXNNZXRhZGF0YTtcbmV4cG9ydHMuaXNDb21wbGV0ZSA9IGlzQ29tcGxldGU7XG5leHBvcnRzLmlzTmV4dCA9IGlzTmV4dDtcbmV4cG9ydHMuaXNSZXNwb25kID0gaXNSZXNwb25kO1xuZXhwb3J0cy5pc1Jlc3VtZUVuYWJsZSA9IGlzUmVzdW1lRW5hYmxlO1xuZXhwb3J0cy5pc0xlYXNlID0gaXNMZWFzZTtcbmV4cG9ydHMuaXNGb2xsb3dzID0gaXNGb2xsb3dzO1xuZXhwb3J0cy5pc1Jlc3VtZVBvc2l0aW9uRnJhbWVUeXBlID0gaXNSZXN1bWVQb3NpdGlvbkZyYW1lVHlwZTtcbmV4cG9ydHMuZ2V0RnJhbWVUeXBlTmFtZSA9IGdldEZyYW1lVHlwZU5hbWU7XG5leHBvcnRzLmNyZWF0ZUVycm9yRnJvbUZyYW1lID0gY3JlYXRlRXJyb3JGcm9tRnJhbWU7XG5leHBvcnRzLmdldEVycm9yQ29kZUV4cGxhbmF0aW9uID0gZ2V0RXJyb3JDb2RlRXhwbGFuYXRpb247XG5leHBvcnRzLnByaW50RnJhbWUgPSBwcmludEZyYW1lO1xuZXhwb3J0cy5NQVhfVkVSU0lPTiA9IGV4cG9ydHMuTUFYX1RUTCA9IGV4cG9ydHMuTUFYX1NUUkVBTV9JRCA9IGV4cG9ydHMuTUFYX1JFU1VNRV9MRU5HVEggPSBleHBvcnRzLk1BWF9SRVFVRVNUX04gPSBleHBvcnRzLk1BWF9SRVFVRVNUX0NPVU5UID0gZXhwb3J0cy5NQVhfTUlNRV9MRU5HVEggPSBleHBvcnRzLk1BWF9NRVRBREFUQV9MRU5HVEggPSBleHBvcnRzLk1BWF9MSUZFVElNRSA9IGV4cG9ydHMuTUFYX0tFRVBBTElWRSA9IGV4cG9ydHMuTUFYX0NPREUgPSBleHBvcnRzLkZSQU1FX1RZUEVfT0ZGRlNFVCA9IGV4cG9ydHMuRkxBR1NfTUFTSyA9IGV4cG9ydHMuRVJST1JfRVhQTEFOQVRJT05TID0gZXhwb3J0cy5FUlJPUl9DT0RFUyA9IGV4cG9ydHMuRkxBR1MgPSBleHBvcnRzLkZSQU1FX1RZUEVfTkFNRVMgPSBleHBvcnRzLkZSQU1FX1RZUEVTID0gZXhwb3J0cy5DT05ORUNUSU9OX1NUUkVBTV9JRCA9IHZvaWQgMDtcbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7XG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7XG4gICAgaWYgKGVudW1lcmFibGVPbmx5KVxuICAgICAgc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7XG4gICAgICB9KTtcbiAgICBrZXlzLnB1c2guYXBwbHkoa2V5cywgc3ltYm9scyk7XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV0gIT0gbnVsbCA/IGFyZ3VtZW50c1tpXSA6IHt9O1xuICAgIGlmIChpICUgMikge1xuICAgICAgb3duS2V5cyhPYmplY3Qoc291cmNlKSwgdHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3duS2V5cyhPYmplY3Qoc291cmNlKSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmNvbnN0IENPTk5FQ1RJT05fU1RSRUFNX0lEID0gMDtcbmV4cG9ydHMuQ09OTkVDVElPTl9TVFJFQU1fSUQgPSBDT05ORUNUSU9OX1NUUkVBTV9JRDtcblxuY29uc3QgRlJBTUVfVFlQRVMgPSB7XG4gIENBTkNFTDogMHgwOSwgLy8gQ2FuY2VsIFJlcXVlc3Q6IENhbmNlbCBvdXRzdGFuZGluZyByZXF1ZXN0LlxuICBFUlJPUjogMHgwYiwgLy8gRXJyb3I6IEVycm9yIGF0IGNvbm5lY3Rpb24gb3IgYXBwbGljYXRpb24gbGV2ZWwuXG4gIEVYVDogMHgzZiwgLy8gRXh0ZW5zaW9uIEhlYWRlcjogVXNlZCBUbyBFeHRlbmQgbW9yZSBmcmFtZSB0eXBlcyBhcyB3ZWxsIGFzIGV4dGVuc2lvbnMuXG4gIEtFRVBBTElWRTogMHgwMywgLy8gS2VlcGFsaXZlOiBDb25uZWN0aW9uIGtlZXBhbGl2ZS5cbiAgTEVBU0U6IDB4MDIsIC8vIExlYXNlOiBTZW50IGJ5IFJlc3BvbmRlciB0byBncmFudCB0aGUgYWJpbGl0eSB0byBzZW5kIHJlcXVlc3RzLlxuICBNRVRBREFUQV9QVVNIOiAweDBjLCAvLyBNZXRhZGF0YTogQXN5bmNocm9ub3VzIE1ldGFkYXRhIGZyYW1lXG4gIFBBWUxPQUQ6IDB4MGEsIC8vIFBheWxvYWQ6IFBheWxvYWQgb24gYSBzdHJlYW0uIEZvciBleGFtcGxlLCByZXNwb25zZSB0byBhIHJlcXVlc3QsIG9yIG1lc3NhZ2Ugb24gYSBjaGFubmVsLlxuICBSRVFVRVNUX0NIQU5ORUw6IDB4MDcsIC8vIFJlcXVlc3QgQ2hhbm5lbDogUmVxdWVzdCBhIGNvbXBsZXRhYmxlIHN0cmVhbSBpbiBib3RoIGRpcmVjdGlvbnMuXG4gIFJFUVVFU1RfRk5GOiAweDA1LCAvLyBGaXJlIEFuZCBGb3JnZXQ6IEEgc2luZ2xlIG9uZS13YXkgbWVzc2FnZS5cbiAgUkVRVUVTVF9OOiAweDA4LCAvLyBSZXF1ZXN0IE46IFJlcXVlc3QgTiBtb3JlIGl0ZW1zIHdpdGggUmVhY3RpdmUgU3RyZWFtcyBzZW1hbnRpY3MuXG4gIFJFUVVFU1RfUkVTUE9OU0U6IDB4MDQsIC8vIFJlcXVlc3QgUmVzcG9uc2U6IFJlcXVlc3Qgc2luZ2xlIHJlc3BvbnNlLlxuICBSRVFVRVNUX1NUUkVBTTogMHgwNiwgLy8gUmVxdWVzdCBTdHJlYW06IFJlcXVlc3QgYSBjb21wbGV0YWJsZSBzdHJlYW0uXG4gIFJFU0VSVkVEOiAweDAwLCAvLyBSZXNlcnZlZFxuICBSRVNVTUU6IDB4MGQsIC8vIFJlc3VtZTogUmVwbGFjZXMgU0VUVVAgZm9yIFJlc3VtaW5nIE9wZXJhdGlvbiAob3B0aW9uYWwpXG4gIFJFU1VNRV9PSzogMHgwZSwgLy8gUmVzdW1lIE9LIDogU2VudCBpbiByZXNwb25zZSB0byBhIFJFU1VNRSBpZiByZXN1bWluZyBvcGVyYXRpb24gcG9zc2libGUgKG9wdGlvbmFsKVxuICBTRVRVUDogMHgwMSwgLy8gU2V0dXA6IFNlbnQgYnkgY2xpZW50IHRvIGluaXRpYXRlIHByb3RvY29sIHByb2Nlc3NpbmcuXG59O1xuXG4vLyBNYXBzIGZyYW1lIHR5cGUgY29kZXMgdG8gdHlwZSBuYW1lc1xuZXhwb3J0cy5GUkFNRV9UWVBFUyA9IEZSQU1FX1RZUEVTO1xuY29uc3QgRlJBTUVfVFlQRV9OQU1FUyA9IHt9O1xuZXhwb3J0cy5GUkFNRV9UWVBFX05BTUVTID0gRlJBTUVfVFlQRV9OQU1FUztcbmZvciAoY29uc3QgbmFtZSBpbiBGUkFNRV9UWVBFUykge1xuICBjb25zdCB2YWx1ZSA9IEZSQU1FX1RZUEVTW25hbWVdO1xuICBGUkFNRV9UWVBFX05BTUVTW3ZhbHVlXSA9IG5hbWU7XG59XG5cbmNvbnN0IEZMQUdTID0ge1xuICBDT01QTEVURTogMHg0MCwgLy8gUEFZTE9BRCwgUkVRVUVTVF9DSEFOTkVMOiBpbmRpY2F0ZXMgc3RyZWFtIGNvbXBsZXRpb24sIGlmIHNldCBvbkNvbXBsZXRlIHdpbGwgYmUgaW52b2tlZCBvbiByZWNlaXZlci5cbiAgRk9MTE9XUzogMHg4MCwgLy8gUEFZTE9BRCwgUkVRVUVTVF9YWFg6IGluZGljYXRlcyB0aGF0IGZyYW1lIHdhcyBmcmFnbWVudGVkIGFuZCByZXF1aXJlcyByZWFzc2VtYmx5XG4gIElHTk9SRTogMHgyMDAsIC8vIChhbGwpOiBJZ25vcmUgZnJhbWUgaWYgbm90IHVuZGVyc3Rvb2QuXG4gIExFQVNFOiAweDQwLCAvLyBTRVRVUDogV2lsbCBob25vciBsZWFzZSBvciBub3QuXG4gIE1FVEFEQVRBOiAweDEwMCwgLy8gKGFsbCk6IG11c3QgYmUgc2V0IGlmIG1ldGFkYXRhIGlzIHByZXNlbnQgaW4gdGhlIGZyYW1lLlxuICBORVhUOiAweDIwLCAvLyBQQVlMT0FEOiBpbmRpY2F0ZXMgZGF0YS9tZXRhZGF0YSBwcmVzZW50LCBpZiBzZXQgb25OZXh0IHdpbGwgYmUgaW52b2tlZCBvbiByZWNlaXZlci5cbiAgUkVTUE9ORDogMHg4MCwgLy8gS0VFUEFMSVZFOiBzaG91bGQgS0VFUEFMSVZFIGJlIHNlbnQgYnkgcGVlciBvbiByZWNlaXB0LlxuICBSRVNVTUVfRU5BQkxFOiAweDgwLCAvLyBTRVRVUDogQ2xpZW50IHJlcXVlc3RzIHJlc3VtZSBjYXBhYmlsaXR5IGlmIHBvc3NpYmxlLiBSZXN1bWUgSWRlbnRpZmljYXRpb24gVG9rZW4gcHJlc2VudC5cbn07XG5cbi8vIE1hcHMgZXJyb3IgbmFtZXMgdG8gY29kZXNcbmV4cG9ydHMuRkxBR1MgPSBGTEFHUztcbmNvbnN0IEVSUk9SX0NPREVTID0ge1xuICBBUFBMSUNBVElPTl9FUlJPUjogMHgwMDAwMDIwMSxcbiAgQ0FOQ0VMRUQ6IDB4MDAwMDAyMDMsXG4gIENPTk5FQ1RJT05fQ0xPU0U6IDB4MDAwMDAxMDIsXG4gIENPTk5FQ1RJT05fRVJST1I6IDB4MDAwMDAxMDEsXG4gIElOVkFMSUQ6IDB4MDAwMDAyMDQsXG4gIElOVkFMSURfU0VUVVA6IDB4MDAwMDAwMDEsXG4gIFJFSkVDVEVEOiAweDAwMDAwMjAyLFxuICBSRUpFQ1RFRF9SRVNVTUU6IDB4MDAwMDAwMDQsXG4gIFJFSkVDVEVEX1NFVFVQOiAweDAwMDAwMDAzLFxuICBSRVNFUlZFRDogMHgwMDAwMDAwMCxcbiAgUkVTRVJWRURfRVhURU5TSU9OOiAweGZmZmZmZmZmLFxuICBVTlNVUFBPUlRFRF9TRVRVUDogMHgwMDAwMDAwMixcbn07XG5cbi8vIE1hcHMgZXJyb3IgY29kZXMgdG8gbmFtZXNcbmV4cG9ydHMuRVJST1JfQ09ERVMgPSBFUlJPUl9DT0RFUztcbmNvbnN0IEVSUk9SX0VYUExBTkFUSU9OUyA9IHt9O1xuZXhwb3J0cy5FUlJPUl9FWFBMQU5BVElPTlMgPSBFUlJPUl9FWFBMQU5BVElPTlM7XG5mb3IgKGNvbnN0IGV4cGxhbmF0aW9uIGluIEVSUk9SX0NPREVTKSB7XG4gIGNvbnN0IGNvZGUgPSBFUlJPUl9DT0RFU1tleHBsYW5hdGlvbl07XG4gIEVSUk9SX0VYUExBTkFUSU9OU1tjb2RlXSA9IGV4cGxhbmF0aW9uO1xufVxuXG5jb25zdCBGTEFHU19NQVNLID0gMHgzZmY7IC8vIGxvdyAxMCBiaXRzXG5leHBvcnRzLkZMQUdTX01BU0sgPSBGTEFHU19NQVNLO1xuY29uc3QgRlJBTUVfVFlQRV9PRkZGU0VUID0gMTA7IC8vIGZyYW1lIHR5cGUgaXMgb2Zmc2V0IDEwIGJ5dGVzIHdpdGhpbiB0aGUgdWludDE2IGNvbnRhaW5pbmcgdHlwZSArIGZsYWdzXG5leHBvcnRzLkZSQU1FX1RZUEVfT0ZGRlNFVCA9IEZSQU1FX1RZUEVfT0ZGRlNFVDtcbmNvbnN0IE1BWF9DT0RFID0gMHg3ZmZmZmZmZjsgLy8gdWludDMxXG5leHBvcnRzLk1BWF9DT0RFID0gTUFYX0NPREU7XG5jb25zdCBNQVhfS0VFUEFMSVZFID0gMHg3ZmZmZmZmZjsgLy8gdWludDMxXG5leHBvcnRzLk1BWF9LRUVQQUxJVkUgPSBNQVhfS0VFUEFMSVZFO1xuY29uc3QgTUFYX0xJRkVUSU1FID0gMHg3ZmZmZmZmZjsgLy8gdWludDMxXG5leHBvcnRzLk1BWF9MSUZFVElNRSA9IE1BWF9MSUZFVElNRTtcbmNvbnN0IE1BWF9NRVRBREFUQV9MRU5HVEggPSAweGZmZmZmZjsgLy8gdWludDI0XG5leHBvcnRzLk1BWF9NRVRBREFUQV9MRU5HVEggPSBNQVhfTUVUQURBVEFfTEVOR1RIO1xuY29uc3QgTUFYX01JTUVfTEVOR1RIID0gMHhmZjsgLy8gaW50OFxuZXhwb3J0cy5NQVhfTUlNRV9MRU5HVEggPSBNQVhfTUlNRV9MRU5HVEg7XG5jb25zdCBNQVhfUkVRVUVTVF9DT1VOVCA9IDB4N2ZmZmZmZmY7IC8vIHVpbnQzMVxuZXhwb3J0cy5NQVhfUkVRVUVTVF9DT1VOVCA9IE1BWF9SRVFVRVNUX0NPVU5UO1xuY29uc3QgTUFYX1JFUVVFU1RfTiA9IDB4N2ZmZmZmZmY7IC8vIHVpbnQzMVxuZXhwb3J0cy5NQVhfUkVRVUVTVF9OID0gTUFYX1JFUVVFU1RfTjtcbmNvbnN0IE1BWF9SRVNVTUVfTEVOR1RIID0gMHhmZmZmOyAvLyB1aW50MTZcbmV4cG9ydHMuTUFYX1JFU1VNRV9MRU5HVEggPSBNQVhfUkVTVU1FX0xFTkdUSDtcbmNvbnN0IE1BWF9TVFJFQU1fSUQgPSAweDdmZmZmZmZmOyAvLyB1aW50MzFcbmV4cG9ydHMuTUFYX1NUUkVBTV9JRCA9IE1BWF9TVFJFQU1fSUQ7XG5jb25zdCBNQVhfVFRMID0gMHg3ZmZmZmZmZjsgLy8gdWludDMxXG5leHBvcnRzLk1BWF9UVEwgPSBNQVhfVFRMO1xuY29uc3QgTUFYX1ZFUlNJT04gPSAweGZmZmY7IC8vIHVpbnQxNlxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGZsYWdzIGhhdmUgdGhlIElHTk9SRSBiaXQgc2V0LlxuICovIGV4cG9ydHMuTUFYX1ZFUlNJT04gPSBNQVhfVkVSU0lPTjtcbmZ1bmN0aW9uIGlzSWdub3JlKGZsYWdzKSB7XG4gIHJldHVybiAoZmxhZ3MgJiBGTEFHUy5JR05PUkUpID09PSBGTEFHUy5JR05PUkU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZmxhZ3MgaGF2ZSB0aGUgTUVUQURBVEEgYml0IHNldC5cbiAqL1xuZnVuY3Rpb24gaXNNZXRhZGF0YShmbGFncykge1xuICByZXR1cm4gKGZsYWdzICYgRkxBR1MuTUVUQURBVEEpID09PSBGTEFHUy5NRVRBREFUQTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBmbGFncyBoYXZlIHRoZSBDT01QTEVURSBiaXQgc2V0LlxuICovXG5mdW5jdGlvbiBpc0NvbXBsZXRlKGZsYWdzKSB7XG4gIHJldHVybiAoZmxhZ3MgJiBGTEFHUy5DT01QTEVURSkgPT09IEZMQUdTLkNPTVBMRVRFO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZmYgdGhlIGZsYWdzIGhhdmUgdGhlIE5FWFQgYml0IHNldC5cbiAqL1xuZnVuY3Rpb24gaXNOZXh0KGZsYWdzKSB7XG4gIHJldHVybiAoZmxhZ3MgJiBGTEFHUy5ORVhUKSA9PT0gRkxBR1MuTkVYVDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBmbGFncyBoYXZlIHRoZSBSRVNQT05EIGJpdCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGlzUmVzcG9uZChmbGFncykge1xuICByZXR1cm4gKGZsYWdzICYgRkxBR1MuUkVTUE9ORCkgPT09IEZMQUdTLlJFU1BPTkQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZmxhZ3MgaGF2ZSB0aGUgUkVTVU1FX0VOQUJMRSBiaXQgc2V0LlxuICovXG5mdW5jdGlvbiBpc1Jlc3VtZUVuYWJsZShmbGFncykge1xuICByZXR1cm4gKGZsYWdzICYgRkxBR1MuUkVTVU1FX0VOQUJMRSkgPT09IEZMQUdTLlJFU1VNRV9FTkFCTEU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmZiB0aGUgZmxhZ3MgaGF2ZSB0aGUgTEVBU0UgYml0IHNldC5cbiAqL1xuZnVuY3Rpb24gaXNMZWFzZShmbGFncykge1xuICByZXR1cm4gKGZsYWdzICYgRkxBR1MuTEVBU0UpID09PSBGTEFHUy5MRUFTRTtcbn1cblxuZnVuY3Rpb24gaXNGb2xsb3dzKGZsYWdzKSB7XG4gIHJldHVybiAoZmxhZ3MgJiBGTEFHUy5GT0xMT1dTKSA9PT0gRkxBR1MuRk9MTE9XUztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWZmIHRoZSBmcmFtZSB0eXBlIGlzIGNvdW50ZWQgdG93YXJkIHRoZSBpbXBsaWVkXG4gKiBjbGllbnQvc2VydmVyIHBvc2l0aW9uIHVzZWQgZm9yIHRoZSByZXN1bXB0aW9uIHByb3RvY29sLlxuICovXG5mdW5jdGlvbiBpc1Jlc3VtZVBvc2l0aW9uRnJhbWVUeXBlKHR5cGUpIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlID09PSBGUkFNRV9UWVBFUy5DQU5DRUwgfHxcbiAgICB0eXBlID09PSBGUkFNRV9UWVBFUy5FUlJPUiB8fFxuICAgIHR5cGUgPT09IEZSQU1FX1RZUEVTLlBBWUxPQUQgfHxcbiAgICB0eXBlID09PSBGUkFNRV9UWVBFUy5SRVFVRVNUX0NIQU5ORUwgfHxcbiAgICB0eXBlID09PSBGUkFNRV9UWVBFUy5SRVFVRVNUX0ZORiB8fFxuICAgIHR5cGUgPT09IEZSQU1FX1RZUEVTLlJFUVVFU1RfUkVTUE9OU0UgfHxcbiAgICB0eXBlID09PSBGUkFNRV9UWVBFUy5SRVFVRVNUX1NUUkVBTSB8fFxuICAgIHR5cGUgPT09IEZSQU1FX1RZUEVTLlJFUVVFU1RfTlxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRGcmFtZVR5cGVOYW1lKHR5cGUpIHtcbiAgY29uc3QgbmFtZSA9IEZSQU1FX1RZUEVfTkFNRVNbdHlwZV07XG4gIHJldHVybiBuYW1lICE9IG51bGwgPyBuYW1lIDogdG9IZXgodHlwZSk7XG59XG5cbmZ1bmN0aW9uIHNwcmludGYoZm9ybWF0LCAuLi5hcmdzKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIHJldHVybiBmb3JtYXQucmVwbGFjZSgvJXMvZywgKG1hdGNoKSA9PiBhcmdzW2luZGV4KytdKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGFuIEVycm9yIG9iamVjdCBnaXZlbiB0aGUgY29udGVudHMgb2YgYW4gZXJyb3IgZnJhbWUuIFRoZVxuICogYHNvdXJjZWAgcHJvcGVydHkgY29udGFpbnMgbWV0YWRhdGEgYWJvdXQgdGhlIGVycm9yIGZvciB1c2UgaW4gaW50cm9zcGVjdGluZ1xuICogdGhlIGVycm9yIGF0IHJ1bnRpbWU6XG4gKiAtIGBlcnJvci5zb3VyY2UuY29kZTogbnVtYmVyYDogdGhlIGVycm9yIGNvZGUgcmV0dXJuZWQgYnkgdGhlIHNlcnZlci5cbiAqIC0gYGVycm9yLnNvdXJjZS5leHBsYW5hdGlvbjogc3RyaW5nYDogaHVtYW4tcmVhZGFibGUgZXhwbGFuYXRpb24gb2YgdGhlIGNvZGVcbiAqICAgKHRoaXMgdmFsdWUgaXMgbm90IHN0YW5kYXJkaXplZCBhbmQgbWF5IGNoYW5nZSkuXG4gKiAtIGBlcnJvci5zb3VyY2UubWVzc2FnZTogc3RyaW5nYDogdGhlIGVycm9yIHN0cmluZyByZXR1cm5lZCBieSB0aGUgc2VydmVyLlxuICovXG5mdW5jdGlvbiBjcmVhdGVFcnJvckZyb21GcmFtZShmcmFtZSkge1xuICBjb25zdCB7Y29kZSwgbWVzc2FnZX0gPSBmcmFtZTtcbiAgY29uc3QgZXhwbGFuYXRpb24gPSBnZXRFcnJvckNvZGVFeHBsYW5hdGlvbihjb2RlKTtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgc3ByaW50ZihcbiAgICAgICdSU29ja2V0IGVycm9yICVzICglcyk6ICVzLiBTZWUgZXJyb3IgYHNvdXJjZWAgcHJvcGVydHkgZm9yIGRldGFpbHMuJyxcbiAgICAgIHRvSGV4KGNvZGUpLFxuICAgICAgZXhwbGFuYXRpb24sXG4gICAgICBtZXNzYWdlXG4gICAgKVxuICApO1xuXG4gIGVycm9yLnNvdXJjZSA9IHtcbiAgICBjb2RlLFxuICAgIGV4cGxhbmF0aW9uLFxuICAgIG1lc3NhZ2UsXG4gIH07XG5cbiAgcmV0dXJuIGVycm9yO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgUlNvY2tldCBlcnJvciBjb2RlLCByZXR1cm5zIGEgaHVtYW4tcmVhZGFibGUgZXhwbGFuYXRpb24gb2YgdGhhdFxuICogY29kZSwgZm9sbG93aW5nIHRoZSBuYW1lcyB1c2VkIGluIHRoZSBwcm90b2NvbCBzcGVjaWZpY2F0aW9uLlxuICovXG5mdW5jdGlvbiBnZXRFcnJvckNvZGVFeHBsYW5hdGlvbihjb2RlKSB7XG4gIGNvbnN0IGV4cGxhbmF0aW9uID0gRVJST1JfRVhQTEFOQVRJT05TW2NvZGVdO1xuICBpZiAoZXhwbGFuYXRpb24gIT0gbnVsbCkge1xuICAgIHJldHVybiBleHBsYW5hdGlvbjtcbiAgfSBlbHNlIGlmIChjb2RlIDw9IDB4MDAzMDApIHtcbiAgICByZXR1cm4gJ1JFU0VSVkVEIChQUk9UT0NPTCknO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnUkVTRVJWRUQgKEFQUExJQ0FUSU9OKSc7XG4gIH1cbn1cblxuLyoqXG4gKiBQcmV0dHktcHJpbnRzIHRoZSBmcmFtZSBmb3IgZGVidWdnaW5nIHB1cnBvc2VzLCB3aXRoIHR5cGVzLCBmbGFncywgYW5kXG4gKiBlcnJvciBjb2RlcyBhbm5vdGF0ZWQgd2l0aCBkZXNjcmlwdGl2ZSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gcHJpbnRGcmFtZShmcmFtZSkge1xuICBjb25zdCBvYmogPSBfb2JqZWN0U3ByZWFkKHt9LCBmcmFtZSk7XG4gIG9iai50eXBlID0gZ2V0RnJhbWVUeXBlTmFtZShmcmFtZS50eXBlKSArIGAgKCR7dG9IZXgoZnJhbWUudHlwZSl9KWA7XG4gIGNvbnN0IGZsYWdOYW1lcyA9IFtdO1xuICBmb3IgKGNvbnN0IG5hbWUgaW4gRkxBR1MpIHtcbiAgICBjb25zdCBmbGFnID0gRkxBR1NbbmFtZV07XG4gICAgaWYgKChmcmFtZS5mbGFncyAmIGZsYWcpID09PSBmbGFnKSB7XG4gICAgICBmbGFnTmFtZXMucHVzaChuYW1lKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFmbGFnTmFtZXMubGVuZ3RoKSB7XG4gICAgZmxhZ05hbWVzLnB1c2goJ05PIEZMQUdTJyk7XG4gIH1cbiAgb2JqLmZsYWdzID0gZmxhZ05hbWVzLmpvaW4oJyB8ICcpICsgYCAoJHt0b0hleChmcmFtZS5mbGFncyl9KWA7XG4gIGlmIChmcmFtZS50eXBlID09PSBGUkFNRV9UWVBFUy5FUlJPUikge1xuICAgIG9iai5jb2RlID0gZ2V0RXJyb3JDb2RlRXhwbGFuYXRpb24oZnJhbWUuY29kZSkgKyBgICgke3RvSGV4KGZyYW1lLmNvZGUpfSlgO1xuICB9XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDIpO1xufVxuXG5mdW5jdGlvbiB0b0hleChuKSB7XG4gIHJldHVybiAnMHgnICsgbi50b1N0cmluZygxNik7XG59XG4iLCIvKiogQ29weXJpZ2h0IDIwMTUtMjAxOSB0aGUgb3JpZ2luYWwgYXV0aG9yIG9yIGF1dGhvcnMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqXG4gKi9cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5SZXNwb25kZXJMZWFzZUhhbmRsZXIgPSBleHBvcnRzLlJlcXVlc3RlckxlYXNlSGFuZGxlciA9IGV4cG9ydHMuTGVhc2VzID0gZXhwb3J0cy5MZWFzZSA9IHZvaWQgMDtcblxudmFyIF9JbnZhcmlhbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoJy4vSW52YXJpYW50JykpO1xudmFyIF9yc29ja2V0Rmxvd2FibGUgPSByZXF1aXJlKCdyc29ja2V0LWZsb3dhYmxlJyk7XG5cbnZhciBfUlNvY2tldEZyYW1lID0gcmVxdWlyZSgnLi9SU29ja2V0RnJhbWUnKTtcbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmpba2V5XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbmNsYXNzIExlYXNlIHtcbiAgY29uc3RydWN0b3IodGltZVRvTGl2ZU1pbGxpcywgYWxsb3dlZFJlcXVlc3RzLCBtZXRhZGF0YSkge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgdGltZVRvTGl2ZU1pbGxpcyA+IDAsXG4gICAgICAnTGVhc2UgdGltZS10by1saXZlIG11c3QgYmUgcG9zaXRpdmUnXG4gICAgKTtcbiAgICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICAgIGFsbG93ZWRSZXF1ZXN0cyA+IDAsXG4gICAgICAnTGVhc2UgYWxsb3dlZCByZXF1ZXN0cyBtdXN0IGJlIHBvc2l0aXZlJ1xuICAgICk7XG4gICAgdGhpcy50aW1lVG9MaXZlTWlsbGlzID0gdGltZVRvTGl2ZU1pbGxpcztcbiAgICB0aGlzLmFsbG93ZWRSZXF1ZXN0cyA9IGFsbG93ZWRSZXF1ZXN0cztcbiAgICB0aGlzLnN0YXJ0aW5nQWxsb3dlZFJlcXVlc3RzID0gYWxsb3dlZFJlcXVlc3RzO1xuICAgIHRoaXMuZXhwaXJ5ID0gRGF0ZS5ub3coKSArIHRpbWVUb0xpdmVNaWxsaXM7XG4gICAgdGhpcy5tZXRhZGF0YSA9IG1ldGFkYXRhO1xuICB9XG5cbiAgZXhwaXJlZCgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSA+IHRoaXMuZXhwaXJ5O1xuICB9XG5cbiAgdmFsaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsb3dlZFJlcXVlc3RzID4gMCAmJiAhdGhpcy5leHBpcmVkKCk7XG4gIH1cblxuICAvLyB0b2RvIGhpZGVcbiAgX3VzZSgpIHtcbiAgICBpZiAodGhpcy5leHBpcmVkKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgYWxsb3dlZCA9IHRoaXMuYWxsb3dlZFJlcXVlc3RzO1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBhbGxvd2VkID4gMDtcbiAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgdGhpcy5hbGxvd2VkUmVxdWVzdHMgPSBhbGxvd2VkIC0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG4gIH1cbn1cbmV4cG9ydHMuTGVhc2UgPSBMZWFzZTtcblxuY2xhc3MgTGVhc2VzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsICdfc2VuZGVyJywgKCkgPT4gX3Jzb2NrZXRGbG93YWJsZS5GbG93YWJsZS5uZXZlcigpKTtcbiAgICBfZGVmaW5lUHJvcGVydHkodGhpcywgJ19yZWNlaXZlcicsIChsZWFzZXMpID0+IHt9KTtcbiAgfVxuXG4gIHNlbmRlcihzZW5kZXIpIHtcbiAgICB0aGlzLl9zZW5kZXIgPSBzZW5kZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZWNlaXZlcihyZWNlaXZlcikge1xuICAgIHRoaXMuX3JlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdGF0cyhzdGF0cykge1xuICAgIHRoaXMuX3N0YXRzID0gc3RhdHM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbmV4cG9ydHMuTGVhc2VzID0gTGVhc2VzO1xuXG5jbGFzcyBSZXF1ZXN0ZXJMZWFzZUhhbmRsZXIge1xuICAvKm5lZ2F0aXZlIHZhbHVlIG1lYW5zIHJlY2VpdmVkIGxlYXNlIHdhcyBub3Qgc2lnbmFsbGVkIGR1ZSB0byBtaXNzaW5nIHJlcXVlc3ROKi9cblxuICBjb25zdHJ1Y3RvcihsZWFzZVJlY2VpdmVyKSB7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsICdfcmVxdWVzdE4nLCAtMSk7XG4gICAgbGVhc2VSZWNlaXZlcihcbiAgICAgIG5ldyBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9zdWJzY3JpYmVyKSB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbkVycm9yKG5ldyBFcnJvcignb25seSAxIHN1YnNjcmliZXIgaXMgYWxsb3dlZCcpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNEaXNwb3NlZCgpKSB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbkNvbXBsZXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1YnNjcmliZXIgPSBzdWJzY3JpYmVyO1xuICAgICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKHtcbiAgICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVxdWVzdDogKG4pID0+IHtcbiAgICAgICAgICAgIGlmIChuIDw9IDApIHtcbiAgICAgICAgICAgICAgc3Vic2NyaWJlci5vbkVycm9yKFxuICAgICAgICAgICAgICAgIG5ldyBFcnJvcihgcmVxdWVzdCBkZW1hbmQgbXVzdCBiZSBwb3NpdGl2ZTogJHtufWApXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNEaXNwb3NlZCgpKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGN1clJlcU4gPSB0aGlzLl9yZXF1ZXN0TjtcbiAgICAgICAgICAgICAgdGhpcy5fb25SZXF1ZXN0TihjdXJSZXFOKTtcbiAgICAgICAgICAgICAgdGhpcy5fcmVxdWVzdE4gPSBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUixcbiAgICAgICAgICAgICAgICBNYXRoLm1heCgwLCBjdXJSZXFOKSArIG5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIHVzZSgpIHtcbiAgICBjb25zdCBsID0gdGhpcy5fbGVhc2U7XG4gICAgcmV0dXJuIGwgPyBsLl91c2UoKSA6IGZhbHNlO1xuICB9XG5cbiAgZXJyb3JNZXNzYWdlKCkge1xuICAgIHJldHVybiBfZXJyb3JNZXNzYWdlKHRoaXMuX2xlYXNlKTtcbiAgfVxuXG4gIHJlY2VpdmUoZnJhbWUpIHtcbiAgICBpZiAoIXRoaXMuaXNEaXNwb3NlZCgpKSB7XG4gICAgICBjb25zdCB0aW1lVG9MaXZlTWlsbGlzID0gZnJhbWUudHRsO1xuICAgICAgY29uc3QgcmVxdWVzdENvdW50ID0gZnJhbWUucmVxdWVzdENvdW50O1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSBmcmFtZS5tZXRhZGF0YTtcbiAgICAgIHRoaXMuX29uTGVhc2UobmV3IExlYXNlKHRpbWVUb0xpdmVNaWxsaXMsIHJlcXVlc3RDb3VudCwgbWV0YWRhdGEpKTtcbiAgICB9XG4gIH1cblxuICBhdmFpbGFiaWxpdHkoKSB7XG4gICAgY29uc3QgbCA9IHRoaXMuX2xlYXNlO1xuICAgIGlmIChsICYmIGwudmFsaWQoKSkge1xuICAgICAgcmV0dXJuIGwuYWxsb3dlZFJlcXVlc3RzIC8gbC5zdGFydGluZ0FsbG93ZWRSZXF1ZXN0cztcbiAgICB9XG4gICAgcmV0dXJuIDAuMDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHMgPSB0aGlzLl9zdWJzY3JpYmVyO1xuICAgICAgaWYgKHMpIHtcbiAgICAgICAgcy5vbkNvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNEaXNwb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXNwb3NlZDtcbiAgfVxuXG4gIF9vblJlcXVlc3ROKHJlcXVlc3ROKSB7XG4gICAgY29uc3QgbCA9IHRoaXMuX2xlYXNlO1xuICAgIGNvbnN0IHMgPSB0aGlzLl9zdWJzY3JpYmVyO1xuICAgIGlmIChyZXF1ZXN0TiA8IDAgJiYgbCAmJiBzKSB7XG4gICAgICBzLm9uTmV4dChsKTtcbiAgICB9XG4gIH1cblxuICBfb25MZWFzZShsZWFzZSkge1xuICAgIGNvbnN0IHMgPSB0aGlzLl9zdWJzY3JpYmVyO1xuICAgIGNvbnN0IG5ld1JlcU4gPSB0aGlzLl9yZXF1ZXN0TiAtIDE7XG4gICAgaWYgKG5ld1JlcU4gPj0gMCAmJiBzKSB7XG4gICAgICBzLm9uTmV4dChsZWFzZSk7XG4gICAgfVxuICAgIHRoaXMuX3JlcXVlc3ROID0gTWF0aC5tYXgoLTEsIG5ld1JlcU4pO1xuICAgIHRoaXMuX2xlYXNlID0gbGVhc2U7XG4gIH1cbn1cbmV4cG9ydHMuUmVxdWVzdGVyTGVhc2VIYW5kbGVyID0gUmVxdWVzdGVyTGVhc2VIYW5kbGVyO1xuXG5jbGFzcyBSZXNwb25kZXJMZWFzZUhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihsZWFzZVNlbmRlciwgc3RhdHMsIGVycm9yQ29uc3VtZXIpIHtcbiAgICB0aGlzLl9sZWFzZVNlbmRlciA9IGxlYXNlU2VuZGVyO1xuICAgIHRoaXMuX3N0YXRzID0gc3RhdHM7XG4gICAgdGhpcy5fZXJyb3JDb25zdW1lciA9IGVycm9yQ29uc3VtZXI7XG4gIH1cblxuICB1c2UoKSB7XG4gICAgY29uc3QgbCA9IHRoaXMuX2xlYXNlO1xuICAgIGNvbnN0IHN1Y2Nlc3MgPSBsID8gbC5fdXNlKCkgOiBmYWxzZTtcbiAgICB0aGlzLl9vblN0YXRzRXZlbnQoc3VjY2Vzcyk7XG4gICAgcmV0dXJuIHN1Y2Nlc3M7XG4gIH1cblxuICBlcnJvck1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIF9lcnJvck1lc3NhZ2UodGhpcy5fbGVhc2UpO1xuICB9XG5cbiAgc2VuZChzZW5kKSB7XG4gICAgbGV0IHN1YnNjcmlwdGlvbjtcbiAgICBsZXQgaXNEaXNwb3NlZDtcblxuICAgIHRoaXMuX2xlYXNlU2VuZGVyKHRoaXMuX3N0YXRzKS5zdWJzY3JpYmUoe1xuICAgICAgb25Db21wbGV0ZTogKCkgPT4gdGhpcy5fb25TdGF0c0V2ZW50KCksXG4gICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgdGhpcy5fb25TdGF0c0V2ZW50KCk7XG4gICAgICAgIGNvbnN0IGVyckNvbnN1bWVyID0gdGhpcy5fZXJyb3JDb25zdW1lcjtcbiAgICAgICAgaWYgKGVyckNvbnN1bWVyKSB7XG4gICAgICAgICAgZXJyQ29uc3VtZXIoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25OZXh0OiAobGVhc2UpID0+IHtcbiAgICAgICAgdGhpcy5fbGVhc2UgPSBsZWFzZTtcbiAgICAgICAgc2VuZChsZWFzZSk7XG4gICAgICB9LFxuICAgICAgb25TdWJzY3JpYmU6IChzKSA9PiB7XG4gICAgICAgIGlmIChpc0Rpc3Bvc2VkKSB7XG4gICAgICAgICAgcy5jYW5jZWwoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcy5yZXF1ZXN0KF9SU29ja2V0RnJhbWUuTUFYX1JFUVVFU1RfTik7XG4gICAgICAgIHN1YnNjcmlwdGlvbiA9IHM7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIGlmICghaXNEaXNwb3NlZCkge1xuICAgICAgICAgIGlzRGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuX29uU3RhdHNFdmVudCgpO1xuICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5jYW5jZWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGlzRGlzcG9zZWQoKSB7XG4gICAgICAgIHJldHVybiBpc0Rpc3Bvc2VkO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgX29uU3RhdHNFdmVudChzdWNjZXNzKSB7XG4gICAgY29uc3QgcyA9IHRoaXMuX3N0YXRzO1xuICAgIGlmIChzKSB7XG4gICAgICBjb25zdCBldmVudCA9XG4gICAgICAgIHN1Y2Nlc3MgPT09IHVuZGVmaW5lZCA/ICdUZXJtaW5hdGUnIDogc3VjY2VzcyA/ICdBY2NlcHQnIDogJ1JlamVjdCc7XG4gICAgICBzLm9uRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0cy5SZXNwb25kZXJMZWFzZUhhbmRsZXIgPSBSZXNwb25kZXJMZWFzZUhhbmRsZXI7XG5cbmZ1bmN0aW9uIF9lcnJvck1lc3NhZ2UobGVhc2UpIHtcbiAgaWYgKCFsZWFzZSkge1xuICAgIHJldHVybiAnTGVhc2Ugd2FzIG5vdCByZWNlaXZlZCB5ZXQnO1xuICB9XG4gIGlmIChsZWFzZS52YWxpZCgpKSB7XG4gICAgcmV0dXJuICdNaXNzaW5nIGxlYXNlcyc7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaXNFeHBpcmVkID0gbGVhc2UuZXhwaXJlZCgpO1xuICAgIGNvbnN0IHJlcXVlc3RzID0gbGVhc2UuYWxsb3dlZFJlcXVlc3RzO1xuICAgIHJldHVybiBgTWlzc2luZyBsZWFzZXMuIEV4cGlyZWQ6ICR7aXNFeHBpcmVkLnRvU3RyaW5nKCl9LCBhbGxvd2VkUmVxdWVzdHM6ICR7cmVxdWVzdHN9YDtcbiAgfVxufVxuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5jcmVhdGVTZXJ2ZXJNYWNoaW5lID0gY3JlYXRlU2VydmVyTWFjaGluZTtcbmV4cG9ydHMuY3JlYXRlQ2xpZW50TWFjaGluZSA9IGNyZWF0ZUNsaWVudE1hY2hpbmU7XG5cbnZhciBfcnNvY2tldEZsb3dhYmxlID0gcmVxdWlyZSgncnNvY2tldC1mbG93YWJsZScpO1xudmFyIF9SU29ja2V0RnJhbWUgPSByZXF1aXJlKCcuL1JTb2NrZXRGcmFtZScpO1xuXG52YXIgX1JTb2NrZXRTZXJpYWxpemF0aW9uID0gcmVxdWlyZSgnLi9SU29ja2V0U2VyaWFsaXphdGlvbicpO1xudmFyIF9SU29ja2V0TGVhc2UgPSByZXF1aXJlKCcuL1JTb2NrZXRMZWFzZScpO1xuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcbiAgICBpZiAoZW51bWVyYWJsZU9ubHkpXG4gICAgICBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTtcbiAgICAgIH0pO1xuICAgIGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG4gICAgaWYgKGkgJSAyKSB7XG4gICAgICBvd25LZXlzKE9iamVjdChzb3VyY2UpLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvd25LZXlzKE9iamVjdChzb3VyY2UpKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuY2xhc3MgUmVzcG9uZGVyV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHJlc3BvbmRlcikge1xuICAgIHRoaXMuX3Jlc3BvbmRlciA9IHJlc3BvbmRlciB8fCB7fTtcbiAgfVxuXG4gIHNldFJlc3BvbmRlcihyZXNwb25kZXIpIHtcbiAgICB0aGlzLl9yZXNwb25kZXIgPSByZXNwb25kZXIgfHwge307XG4gIH1cblxuICBmaXJlQW5kRm9yZ2V0KHBheWxvYWQpIHtcbiAgICBpZiAodGhpcy5fcmVzcG9uZGVyLmZpcmVBbmRGb3JnZXQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuX3Jlc3BvbmRlci5maXJlQW5kRm9yZ2V0KHBheWxvYWQpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignZmlyZUFuZEZvcmdldCB0aHJldyBhbiBleGNlcHRpb24nLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVxdWVzdFJlc3BvbnNlKHBheWxvYWQpIHtcbiAgICBsZXQgZXJyb3I7XG4gICAgaWYgKHRoaXMuX3Jlc3BvbmRlci5yZXF1ZXN0UmVzcG9uc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZXNwb25kZXIucmVxdWVzdFJlc3BvbnNlKHBheWxvYWQpO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3JlcXVlc3RSZXNwb25zZSB0aHJldyBhbiBleGNlcHRpb24nLCBfZXJyb3IpO1xuICAgICAgICBlcnJvciA9IF9lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9yc29ja2V0Rmxvd2FibGUuU2luZ2xlLmVycm9yKGVycm9yIHx8IG5ldyBFcnJvcignbm90IGltcGxlbWVudGVkJykpO1xuICB9XG5cbiAgcmVxdWVzdFN0cmVhbShwYXlsb2FkKSB7XG4gICAgbGV0IGVycm9yO1xuICAgIGlmICh0aGlzLl9yZXNwb25kZXIucmVxdWVzdFN0cmVhbSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BvbmRlci5yZXF1ZXN0U3RyZWFtKHBheWxvYWQpO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ3JlcXVlc3RTdHJlYW0gdGhyZXcgYW4gZXhjZXB0aW9uJywgX2Vycm9yKTtcbiAgICAgICAgZXJyb3IgPSBfZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlLmVycm9yKFxuICAgICAgZXJyb3IgfHwgbmV3IEVycm9yKCdub3QgaW1wbGVtZW50ZWQnKVxuICAgICk7XG4gIH1cblxuICByZXF1ZXN0Q2hhbm5lbChwYXlsb2Fkcykge1xuICAgIGxldCBlcnJvcjtcbiAgICBpZiAodGhpcy5fcmVzcG9uZGVyLnJlcXVlc3RDaGFubmVsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVzcG9uZGVyLnJlcXVlc3RDaGFubmVsKHBheWxvYWRzKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdyZXF1ZXN0Q2hhbm5lbCB0aHJldyBhbiBleGNlcHRpb24nLCBfZXJyb3IpO1xuICAgICAgICBlcnJvciA9IF9lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9yc29ja2V0Rmxvd2FibGUuRmxvd2FibGUuZXJyb3IoXG4gICAgICBlcnJvciB8fCBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpXG4gICAgKTtcbiAgfVxuXG4gIG1ldGFkYXRhUHVzaChwYXlsb2FkKSB7XG4gICAgbGV0IGVycm9yO1xuICAgIGlmICh0aGlzLl9yZXNwb25kZXIubWV0YWRhdGFQdXNoKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVzcG9uZGVyLm1ldGFkYXRhUHVzaChwYXlsb2FkKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdtZXRhZGF0YVB1c2ggdGhyZXcgYW4gZXhjZXB0aW9uJywgX2Vycm9yKTtcbiAgICAgICAgZXJyb3IgPSBfZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcnNvY2tldEZsb3dhYmxlLlNpbmdsZS5lcnJvcihlcnJvciB8fCBuZXcgRXJyb3IoJ25vdCBpbXBsZW1lbnRlZCcpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTZXJ2ZXJNYWNoaW5lKFxuICBjb25uZWN0aW9uLFxuICBjb25uZWN0aW9uUHVibGlzaGVyLFxuICBrZWVwQWxpdmVUaW1lb3V0LFxuICBzZXJpYWxpemVycyxcbiAgZXJyb3JIYW5kbGVyLFxuICByZXF1ZXN0ZXJMZWFzZUhhbmRsZXIsXG4gIHJlc3BvbmRlckxlYXNlSGFuZGxlclxuKSB7XG4gIHJldHVybiBuZXcgUlNvY2tldE1hY2hpbmVJbXBsKFxuICAgICdTRVJWRVInLFxuICAgIGNvbm5lY3Rpb24sXG4gICAgY29ubmVjdGlvblB1Ymxpc2hlcixcbiAgICBrZWVwQWxpdmVUaW1lb3V0LFxuICAgIHNlcmlhbGl6ZXJzLFxuICAgIHVuZGVmaW5lZCxcbiAgICBlcnJvckhhbmRsZXIsXG4gICAgcmVxdWVzdGVyTGVhc2VIYW5kbGVyLFxuICAgIHJlc3BvbmRlckxlYXNlSGFuZGxlclxuICApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGllbnRNYWNoaW5lKFxuICBjb25uZWN0aW9uLFxuICBjb25uZWN0aW9uUHVibGlzaGVyLFxuICBrZWVwQWxpdmVUaW1lb3V0LFxuICBzZXJpYWxpemVycyxcbiAgcmVxdWVzdEhhbmRsZXIsXG4gIGVycm9ySGFuZGxlcixcbiAgcmVxdWVzdGVyTGVhc2VIYW5kbGVyLFxuICByZXNwb25kZXJMZWFzZUhhbmRsZXJcbikge1xuICByZXR1cm4gbmV3IFJTb2NrZXRNYWNoaW5lSW1wbChcbiAgICAnQ0xJRU5UJyxcbiAgICBjb25uZWN0aW9uLFxuICAgIGNvbm5lY3Rpb25QdWJsaXNoZXIsXG4gICAga2VlcEFsaXZlVGltZW91dCxcbiAgICBzZXJpYWxpemVycyxcbiAgICByZXF1ZXN0SGFuZGxlcixcbiAgICBlcnJvckhhbmRsZXIsXG4gICAgcmVxdWVzdGVyTGVhc2VIYW5kbGVyLFxuICAgIHJlc3BvbmRlckxlYXNlSGFuZGxlclxuICApO1xufVxuXG5jbGFzcyBSU29ja2V0TWFjaGluZUltcGwge1xuICBjb25zdHJ1Y3RvcihcbiAgICByb2xlLFxuICAgIGNvbm5lY3Rpb24sXG4gICAgY29ubmVjdGlvblB1Ymxpc2hlcixcbiAgICBrZWVwQWxpdmVUaW1lb3V0LFxuICAgIHNlcmlhbGl6ZXJzLFxuICAgIHJlcXVlc3RIYW5kbGVyLFxuICAgIGVycm9ySGFuZGxlcixcbiAgICByZXF1ZXN0ZXJMZWFzZUhhbmRsZXIsXG4gICAgcmVzcG9uZGVyTGVhc2VIYW5kbGVyXG4gICkge1xuICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2Nvbm5lY3Rpb25BdmFpbGFiaWxpdHknLCAxLjApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShcbiAgICAgIHRoaXMsXG4gICAgICAnX2hhbmRsZVRyYW5zcG9ydENsb3NlJyxcblxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVFcnJvcihuZXcgRXJyb3IoJ1JTb2NrZXQ6IFRoZSBjb25uZWN0aW9uIHdhcyBjbG9zZWQuJykpO1xuICAgICAgfVxuICAgICk7XG4gICAgX2RlZmluZVByb3BlcnR5KFxuICAgICAgdGhpcyxcbiAgICAgICdfaGFuZGxlRXJyb3InLFxuXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gRXJyb3IgYW55IG9wZW4gcmVxdWVzdCBzdHJlYW1zXG4gICAgICAgIHRoaXMuX3JlY2VpdmVycy5mb3JFYWNoKChyZWNlaXZlcikgPT4ge1xuICAgICAgICAgIHJlY2VpdmVyLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcmVjZWl2ZXJzLmNsZWFyKCk7XG4gICAgICAgIC8vIENhbmNlbCBhbnkgYWN0aXZlIHN1YnNjcmlwdGlvbnNcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5mb3JFYWNoKChzdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25BdmFpbGFiaWxpdHkgPSAwLjA7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2UoXG4gICAgICAgICAgdGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyLFxuICAgICAgICAgIHRoaXMuX3Jlc3BvbmRlckxlYXNlU2VuZGVyRGlzcG9zYWJsZVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGhhbmRsZSA9IHRoaXMuX2tlZXBBbGl2ZVRpbWVySGFuZGxlO1xuICAgICAgICBpZiAoaGFuZGxlKSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgICAgICAgdGhpcy5fa2VlcEFsaXZlVGltZXJIYW5kbGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoXG4gICAgICB0aGlzLFxuICAgICAgJ19oYW5kbGVGcmFtZScsXG5cbiAgICAgIChmcmFtZSkgPT4ge1xuICAgICAgICBjb25zdCB7c3RyZWFtSWR9ID0gZnJhbWU7XG4gICAgICAgIGlmIChzdHJlYW1JZCA9PT0gX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRCkge1xuICAgICAgICAgIHRoaXMuX2hhbmRsZUNvbm5lY3Rpb25GcmFtZShmcmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlU3RyZWFtRnJhbWUoc3RyZWFtSWQsIGZyYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgdGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyID0gcmVxdWVzdGVyTGVhc2VIYW5kbGVyO1xuICAgIHRoaXMuX3Jlc3BvbmRlckxlYXNlSGFuZGxlciA9IHJlc3BvbmRlckxlYXNlSGFuZGxlcjtcbiAgICB0aGlzLl9uZXh0U3RyZWFtSWQgPSByb2xlID09PSAnQ0xJRU5UJyA/IDEgOiAyO1xuICAgIHRoaXMuX3JlY2VpdmVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXJzID1cbiAgICAgIHNlcmlhbGl6ZXJzIHx8IF9SU29ja2V0U2VyaWFsaXphdGlvbi5JZGVudGl0eVNlcmlhbGl6ZXJzO1xuICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyID0gbmV3IFJlc3BvbmRlcldyYXBwZXIocmVxdWVzdEhhbmRsZXIpO1xuICAgIHRoaXMuX2Vycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlcjsgLy8gU3Vic2NyaWJlIHRvIGNvbXBsZXRpb24vZXJyb3JzIGJlZm9yZSBzZW5kaW5nIGFueXRoaW5nXG4gICAgY29ubmVjdGlvblB1Ymxpc2hlcih7XG4gICAgICBvbkNvbXBsZXRlOiB0aGlzLl9oYW5kbGVUcmFuc3BvcnRDbG9zZSxcbiAgICAgIG9uRXJyb3I6IHRoaXMuX2hhbmRsZUVycm9yLFxuICAgICAgb25OZXh0OiB0aGlzLl9oYW5kbGVGcmFtZSxcbiAgICAgIG9uU3Vic2NyaWJlOiAoc3Vic2NyaXB0aW9uKSA9PlxuICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiksXG4gICAgfSk7XG4gICAgY29uc3QgcmVzcG9uZGVySGFuZGxlciA9IHRoaXMuX3Jlc3BvbmRlckxlYXNlSGFuZGxlcjtcbiAgICBpZiAocmVzcG9uZGVySGFuZGxlcikge1xuICAgICAgdGhpcy5fcmVzcG9uZGVyTGVhc2VTZW5kZXJEaXNwb3NhYmxlID0gcmVzcG9uZGVySGFuZGxlci5zZW5kKFxuICAgICAgICB0aGlzLl9sZWFzZUZyYW1lU2VuZGVyKClcbiAgICAgICk7XG4gICAgfSAvLyBDbGVhbnVwIHdoZW4gdGhlIGNvbm5lY3Rpb24gY2xvc2VzXG4gICAgdGhpcy5fY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdHVzKCkuc3Vic2NyaWJlKHtcbiAgICAgIG9uTmV4dDogKHN0YXR1cykgPT4ge1xuICAgICAgICBpZiAoc3RhdHVzLmtpbmQgPT09ICdDTE9TRUQnKSB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlVHJhbnNwb3J0Q2xvc2UoKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0dXMua2luZCA9PT0gJ0VSUk9SJykge1xuICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yKHN0YXR1cy5lcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblN1YnNjcmliZTogKHN1YnNjcmlwdGlvbikgPT5cbiAgICAgICAgc3Vic2NyaXB0aW9uLnJlcXVlc3QoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpLFxuICAgIH0pO1xuICAgIGNvbnN0IE1JTl9USUNLX0RVUkFUSU9OID0gMTAwO1xuICAgIHRoaXMuX2tlZXBBbGl2ZUxhc3RSZWNlaXZlZE1pbGxpcyA9IERhdGUubm93KCk7XG4gICAgY29uc3Qga2VlcEFsaXZlSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICBjb25zdCBub0tlZXBBbGl2ZUR1cmF0aW9uID0gbm93IC0gdGhpcy5fa2VlcEFsaXZlTGFzdFJlY2VpdmVkTWlsbGlzO1xuICAgICAgaWYgKG5vS2VlcEFsaXZlRHVyYXRpb24gPj0ga2VlcEFsaXZlVGltZW91dCkge1xuICAgICAgICB0aGlzLl9oYW5kbGVDb25uZWN0aW9uRXJyb3IoXG4gICAgICAgICAgbmV3IEVycm9yKGBObyBrZWVwLWFsaXZlIGFja3MgZm9yICR7a2VlcEFsaXZlVGltZW91dH0gbWlsbGlzYClcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2tlZXBBbGl2ZVRpbWVySGFuZGxlID0gc2V0VGltZW91dChcbiAgICAgICAgICBrZWVwQWxpdmVIYW5kbGVyLFxuICAgICAgICAgIE1hdGgubWF4KE1JTl9USUNLX0RVUkFUSU9OLCBrZWVwQWxpdmVUaW1lb3V0IC0gbm9LZWVwQWxpdmVEdXJhdGlvbilcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMuX2tlZXBBbGl2ZVRpbWVySGFuZGxlID0gc2V0VGltZW91dChrZWVwQWxpdmVIYW5kbGVyLCBrZWVwQWxpdmVUaW1lb3V0KTtcbiAgfVxuICBzZXRSZXF1ZXN0SGFuZGxlcihyZXF1ZXN0SGFuZGxlcikge1xuICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyLnNldFJlc3BvbmRlcihyZXF1ZXN0SGFuZGxlcik7XG4gIH1cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG4gIGNvbm5lY3Rpb25TdGF0dXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24uY29ubmVjdGlvblN0YXR1cygpO1xuICB9XG4gIGF2YWlsYWJpbGl0eSgpIHtcbiAgICBjb25zdCByID0gdGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyO1xuICAgIGNvbnN0IHJlcXVlc3RlckF2YWlsYWJpbGl0eSA9IHIgPyByLmF2YWlsYWJpbGl0eSgpIDogMS4wO1xuICAgIHJldHVybiBNYXRoLm1pbih0aGlzLl9jb25uZWN0aW9uQXZhaWxhYmlsaXR5LCByZXF1ZXN0ZXJBdmFpbGFiaWxpdHkpO1xuICB9XG4gIGZpcmVBbmRGb3JnZXQocGF5bG9hZCkge1xuICAgIGlmICh0aGlzLl91c2VMZWFzZU9yRXJyb3IodGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdHJlYW1JZCA9IHRoaXMuX2dldE5leHRTdHJlYW1JZCh0aGlzLl9yZWNlaXZlcnMpO1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5kYXRhLnNlcmlhbGl6ZShwYXlsb2FkLmRhdGEpO1xuICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5fc2VyaWFsaXplcnMubWV0YWRhdGEuc2VyaWFsaXplKHBheWxvYWQubWV0YWRhdGEpO1xuICAgIGNvbnN0IGZyYW1lID0ge1xuICAgICAgZGF0YSxcbiAgICAgIGZsYWdzOiBwYXlsb2FkLm1ldGFkYXRhICE9PSB1bmRlZmluZWQgPyBfUlNvY2tldEZyYW1lLkZMQUdTLk1FVEFEQVRBIDogMCxcbiAgICAgIG1ldGFkYXRhLFxuICAgICAgc3RyZWFtSWQsXG4gICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfRk5GLFxuICAgIH07XG4gICAgdGhpcy5fY29ubmVjdGlvbi5zZW5kT25lKGZyYW1lKTtcbiAgfVxuICByZXF1ZXN0UmVzcG9uc2UocGF5bG9hZCkge1xuICAgIGNvbnN0IGxlYXNlRXJyb3IgPSB0aGlzLl91c2VMZWFzZU9yRXJyb3IodGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyKTtcbiAgICBpZiAobGVhc2VFcnJvcikge1xuICAgICAgcmV0dXJuIF9yc29ja2V0Rmxvd2FibGUuU2luZ2xlLmVycm9yKG5ldyBFcnJvcihsZWFzZUVycm9yKSk7XG4gICAgfVxuICAgIGNvbnN0IHN0cmVhbUlkID0gdGhpcy5fZ2V0TmV4dFN0cmVhbUlkKHRoaXMuX3JlY2VpdmVycyk7XG4gICAgcmV0dXJuIG5ldyBfcnNvY2tldEZsb3dhYmxlLlNpbmdsZSgoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgdGhpcy5fcmVjZWl2ZXJzLnNldChzdHJlYW1JZCwge1xuICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7fSxcbiAgICAgICAgb25FcnJvcjogKGVycm9yKSA9PiBzdWJzY3JpYmVyLm9uRXJyb3IoZXJyb3IpLFxuICAgICAgICBvbk5leHQ6IChkYXRhKSA9PiBzdWJzY3JpYmVyLm9uQ29tcGxldGUoZGF0YSksXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5kYXRhLnNlcmlhbGl6ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5tZXRhZGF0YS5zZXJpYWxpemUocGF5bG9hZC5tZXRhZGF0YSk7XG4gICAgICBjb25zdCBmcmFtZSA9IHtcbiAgICAgICAgZGF0YSxcbiAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgcGF5bG9hZC5tZXRhZGF0YSAhPT0gdW5kZWZpbmVkID8gX1JTb2NrZXRGcmFtZS5GTEFHUy5NRVRBREFUQSA6IDAsXG4gICAgICAgIG1ldGFkYXRhLFxuICAgICAgICBzdHJlYW1JZCxcbiAgICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX1JFU1BPTlNFLFxuICAgICAgfTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZShmcmFtZSk7XG4gICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgdGhpcy5fcmVjZWl2ZXJzLmRlbGV0ZShzdHJlYW1JZCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbEZyYW1lID0ge1xuICAgICAgICAgIGZsYWdzOiAwLFxuICAgICAgICAgIHN0cmVhbUlkLFxuICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuQ0FOQ0VMLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUoY2FuY2VsRnJhbWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmVxdWVzdFN0cmVhbShwYXlsb2FkKSB7XG4gICAgY29uc3QgbGVhc2VFcnJvciA9IHRoaXMuX3VzZUxlYXNlT3JFcnJvcih0aGlzLl9yZXF1ZXN0ZXJMZWFzZUhhbmRsZXIpO1xuICAgIGlmIChsZWFzZUVycm9yKSB7XG4gICAgICByZXR1cm4gX3Jzb2NrZXRGbG93YWJsZS5GbG93YWJsZS5lcnJvcihuZXcgRXJyb3IobGVhc2VFcnJvcikpO1xuICAgIH1cbiAgICBjb25zdCBzdHJlYW1JZCA9IHRoaXMuX2dldE5leHRTdHJlYW1JZCh0aGlzLl9yZWNlaXZlcnMpO1xuICAgIHJldHVybiBuZXcgX3Jzb2NrZXRGbG93YWJsZS5GbG93YWJsZSgoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgdGhpcy5fcmVjZWl2ZXJzLnNldChzdHJlYW1JZCwgc3Vic2NyaWJlcik7XG4gICAgICBsZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoe1xuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9yZWNlaXZlcnMuZGVsZXRlKHN0cmVhbUlkKTtcbiAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNhbmNlbEZyYW1lID0ge1xuICAgICAgICAgICAgZmxhZ3M6IDAsXG4gICAgICAgICAgICBzdHJlYW1JZCxcbiAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuQ0FOQ0VMLFxuICAgICAgICAgIH07XG4gICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZW5kT25lKGNhbmNlbEZyYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWVzdDogKG4pID0+IHtcbiAgICAgICAgICBpZiAobiA+IF9SU29ja2V0RnJhbWUuTUFYX1JFUVVFU1RfTikge1xuICAgICAgICAgICAgbiA9IF9SU29ja2V0RnJhbWUuTUFYX1JFUVVFU1RfTjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0TkZyYW1lID0ge1xuICAgICAgICAgICAgICBmbGFnczogMCxcbiAgICAgICAgICAgICAgcmVxdWVzdE46IG4sXG4gICAgICAgICAgICAgIHN0cmVhbUlkLFxuICAgICAgICAgICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUocmVxdWVzdE5GcmFtZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5kYXRhLnNlcmlhbGl6ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5tZXRhZGF0YS5zZXJpYWxpemUoXG4gICAgICAgICAgICAgIHBheWxvYWQubWV0YWRhdGFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0U3RyZWFtRnJhbWUgPSB7XG4gICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgIGZsYWdzOlxuICAgICAgICAgICAgICAgIHBheWxvYWQubWV0YWRhdGEgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgPyBfUlNvY2tldEZyYW1lLkZMQUdTLk1FVEFEQVRBXG4gICAgICAgICAgICAgICAgICA6IDAsXG4gICAgICAgICAgICAgIG1ldGFkYXRhLFxuICAgICAgICAgICAgICByZXF1ZXN0TjogbixcbiAgICAgICAgICAgICAgc3RyZWFtSWQsXG4gICAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9TVFJFQU0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZW5kT25lKHJlcXVlc3RTdHJlYW1GcmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSwgX1JTb2NrZXRGcmFtZS5NQVhfUkVRVUVTVF9OKTtcbiAgfVxuICByZXF1ZXN0Q2hhbm5lbChwYXlsb2Fkcykge1xuICAgIGNvbnN0IGxlYXNlRXJyb3IgPSB0aGlzLl91c2VMZWFzZU9yRXJyb3IodGhpcy5fcmVxdWVzdGVyTGVhc2VIYW5kbGVyKTtcbiAgICBpZiAobGVhc2VFcnJvcikge1xuICAgICAgcmV0dXJuIF9yc29ja2V0Rmxvd2FibGUuRmxvd2FibGUuZXJyb3IobmV3IEVycm9yKGxlYXNlRXJyb3IpKTtcbiAgICB9XG4gICAgY29uc3Qgc3RyZWFtSWQgPSB0aGlzLl9nZXROZXh0U3RyZWFtSWQodGhpcy5fcmVjZWl2ZXJzKTtcbiAgICBsZXQgcGF5bG9hZHNTdWJzY3JpYmVkID0gZmFsc2U7XG4gICAgcmV0dXJuIG5ldyBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLl9yZWNlaXZlcnMuc2V0KHN0cmVhbUlkLCBzdWJzY3JpYmVyKTtcbiAgICAgICAgbGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoe1xuICAgICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVjZWl2ZXJzLmRlbGV0ZShzdHJlYW1JZCk7XG4gICAgICAgICAgICBpZiAoIWluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhbmNlbEZyYW1lID0ge1xuICAgICAgICAgICAgICBmbGFnczogMCxcbiAgICAgICAgICAgICAgc3RyZWFtSWQsXG4gICAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuQ0FOQ0VMLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZShjYW5jZWxGcmFtZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZXF1ZXN0OiAobikgPT4ge1xuICAgICAgICAgICAgaWYgKG4gPiBfUlNvY2tldEZyYW1lLk1BWF9SRVFVRVNUX04pIHtcbiAgICAgICAgICAgICAgbiA9IF9SU29ja2V0RnJhbWUuTUFYX1JFUVVFU1RfTjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0TkZyYW1lID0ge1xuICAgICAgICAgICAgICAgIGZsYWdzOiAwLFxuICAgICAgICAgICAgICAgIHJlcXVlc3ROOiBuLFxuICAgICAgICAgICAgICAgIHN0cmVhbUlkLFxuICAgICAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9OLFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUocmVxdWVzdE5GcmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIXBheWxvYWRzU3Vic2NyaWJlZCkge1xuICAgICAgICAgICAgICAgIHBheWxvYWRzU3Vic2NyaWJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcGF5bG9hZHMuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VuZFN0cmVhbUNvbXBsZXRlKHN0cmVhbUlkKTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VuZFN0cmVhbUVycm9yKHN0cmVhbUlkLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgIH0sIC8vU3Vic2NyaWJlciBtZXRob2RzXG4gICAgICAgICAgICAgICAgICBvbk5leHQ6IChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5kYXRhLnNlcmlhbGl6ZShwYXlsb2FkLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuX3NlcmlhbGl6ZXJzLm1ldGFkYXRhLnNlcmlhbGl6ZShcbiAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLm1ldGFkYXRhXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVxdWVzdENoYW5uZWxGcmFtZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGFnczpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bG9hZC5tZXRhZGF0YSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfUlNvY2tldEZyYW1lLkZMQUdTLk1FVEFEQVRBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0TjogbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0NIQU5ORUwsXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUocmVxdWVzdENoYW5uZWxGcmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF5bG9hZEZyYW1lID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsYWdzOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBfUlNvY2tldEZyYW1lLkZMQUdTLk5FWFQgfFxuICAgICAgICAgICAgICAgICAgICAgICAgICAocGF5bG9hZC5tZXRhZGF0YSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfUlNvY2tldEZyYW1lLkZMQUdTLk1FVEFEQVRBXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGFkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWFtSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlBBWUxPQUQsXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUocGF5bG9hZEZyYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIG9uU3Vic2NyaWJlOiAoc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHN0cmVhbUlkLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdCgxKTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgJ1JTb2NrZXRDbGllbnQ6IHJlLWVudHJhbnQgY2FsbCB0byByZXF1ZXN0IG4gYmVmb3JlIGluaXRpYWwnICtcbiAgICAgICAgICAgICAgICAgICAgJyBjaGFubmVsIGVzdGFibGlzaGVkLidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCdFeGNlcHRpb24gd2hpbGUgc3Vic2NyaWJpbmcgdG8gY2hhbm5lbCBmbG93YWJsZTonICsgZXJyKTtcbiAgICAgIH1cbiAgICB9LCBfUlNvY2tldEZyYW1lLk1BWF9SRVFVRVNUX04pO1xuICB9XG4gIG1ldGFkYXRhUHVzaChwYXlsb2FkKSB7XG4gICAgcmV0dXJuIG5ldyBfcnNvY2tldEZsb3dhYmxlLlNpbmdsZSgoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5tZXRhZGF0YS5zZXJpYWxpemUocGF5bG9hZC5tZXRhZGF0YSk7XG4gICAgICBjb25zdCBmcmFtZSA9IHtcbiAgICAgICAgZmxhZ3M6IDAsXG4gICAgICAgIG1ldGFkYXRhLFxuICAgICAgICBzdHJlYW1JZDogMCxcbiAgICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5NRVRBREFUQV9QVVNILFxuICAgICAgfTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZShmcmFtZSk7XG4gICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKCgpID0+IHt9KTtcbiAgICAgIHN1YnNjcmliZXIub25Db21wbGV0ZSgpO1xuICAgIH0pO1xuICB9XG4gIF9nZXROZXh0U3RyZWFtSWQoc3RyZWFtSWRzKSB7XG4gICAgY29uc3Qgc3RyZWFtSWQgPSB0aGlzLl9uZXh0U3RyZWFtSWQ7XG4gICAgZG8ge1xuICAgICAgdGhpcy5fbmV4dFN0cmVhbUlkID1cbiAgICAgICAgKHRoaXMuX25leHRTdHJlYW1JZCArIDIpICYgX1JTb2NrZXRGcmFtZS5NQVhfU1RSRUFNX0lEO1xuICAgIH0gd2hpbGUgKHRoaXMuX25leHRTdHJlYW1JZCA9PT0gMCB8fCBzdHJlYW1JZHMuaGFzKHN0cmVhbUlkKSk7XG4gICAgcmV0dXJuIHN0cmVhbUlkO1xuICB9XG4gIF91c2VMZWFzZU9yRXJyb3IobGVhc2VIYW5kbGVyKSB7XG4gICAgaWYgKGxlYXNlSGFuZGxlcikge1xuICAgICAgaWYgKCFsZWFzZUhhbmRsZXIudXNlKCkpIHtcbiAgICAgICAgcmV0dXJuIGxlYXNlSGFuZGxlci5lcnJvck1lc3NhZ2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgX2xlYXNlRnJhbWVTZW5kZXIoKSB7XG4gICAgcmV0dXJuIChsZWFzZSkgPT5cbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZSh7XG4gICAgICAgIGZsYWdzOiAwLFxuICAgICAgICBtZXRhZGF0YTogbGVhc2UubWV0YWRhdGEsXG4gICAgICAgIHJlcXVlc3RDb3VudDogbGVhc2UuYWxsb3dlZFJlcXVlc3RzLFxuICAgICAgICBzdHJlYW1JZDogX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRCxcbiAgICAgICAgdHRsOiBsZWFzZS50aW1lVG9MaXZlTWlsbGlzLFxuICAgICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkxFQVNFLFxuICAgICAgfSk7XG4gIH1cbiAgX2Rpc3Bvc2UoLi4uZGlzcG9zYWJsZXMpIHtcbiAgICBkaXNwb3NhYmxlcy5mb3JFYWNoKChkKSA9PiB7XG4gICAgICBpZiAoZCkge1xuICAgICAgICBkLmRpc3Bvc2UoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBfaXNSZXF1ZXN0KGZyYW1lVHlwZSkge1xuICAgIHN3aXRjaCAoZnJhbWVUeXBlKSB7XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9GTkY6XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9SRVNQT05TRTpcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX1NUUkVBTTpcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0NIQU5ORUw6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogSGFuZGxlIHRoZSBjb25uZWN0aW9uIGNsb3Npbmcgbm9ybWFsbHk6IHRoaXMgaXMgYW4gZXJyb3IgZm9yIGFueSBvcGVuIHN0cmVhbXMuXG4gICAqLyBfaGFuZGxlQ29ubmVjdGlvbkVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5faGFuZGxlRXJyb3IoZXJyb3IpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICBjb25zdCBlcnJvckhhbmRsZXIgPSB0aGlzLl9lcnJvckhhbmRsZXI7XG4gICAgaWYgKGVycm9ySGFuZGxlcikge1xuICAgICAgZXJyb3JIYW5kbGVyKGVycm9yKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEhhbmRsZSBhIGZyYW1lIHJlY2VpdmVkIGZyb20gdGhlIHRyYW5zcG9ydCBjbGllbnQuXG4gICAqLyAvKipcbiAgICogSGFuZGxlIGNvbm5lY3Rpb24gZnJhbWVzIChzdHJlYW0gaWQgPT09IDApLlxuICAgKi8gX2hhbmRsZUNvbm5lY3Rpb25GcmFtZShmcmFtZSkge1xuICAgIHN3aXRjaCAoZnJhbWUudHlwZSkge1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkVSUk9SOlxuICAgICAgICBjb25zdCBlcnJvciA9ICgwLCBfUlNvY2tldEZyYW1lLmNyZWF0ZUVycm9yRnJvbUZyYW1lKShmcmFtZSk7XG4gICAgICAgIHRoaXMuX2hhbmRsZUNvbm5lY3Rpb25FcnJvcihlcnJvcik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkVYVDpcbiAgICAgICAgLy8gRXh0ZW5zaW9ucyBhcmUgbm90IHN1cHBvcnRlZFxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5LRUVQQUxJVkU6XG4gICAgICAgIHRoaXMuX2tlZXBBbGl2ZUxhc3RSZWNlaXZlZE1pbGxpcyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmICgoMCwgX1JTb2NrZXRGcmFtZS5pc1Jlc3BvbmQpKGZyYW1lLmZsYWdzKSkge1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZShcbiAgICAgICAgICAgIF9vYmplY3RTcHJlYWQoXG4gICAgICAgICAgICAgIF9vYmplY3RTcHJlYWQoe30sIGZyYW1lKSxcbiAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBmbGFnczogZnJhbWUuZmxhZ3MgXiBfUlNvY2tldEZyYW1lLkZMQUdTLlJFU1BPTkQsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYml0d2lzZVxuICAgICAgICAgICAgICAgIGxhc3RSZWNlaXZlZFBvc2l0aW9uOiAwLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5MRUFTRTpcbiAgICAgICAgY29uc3QgciA9IHRoaXMuX3JlcXVlc3RlckxlYXNlSGFuZGxlcjtcbiAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICByLnJlY2VpdmUoZnJhbWUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLk1FVEFEQVRBX1BVU0g6XG4gICAgICAgIHRoaXMuX2hhbmRsZU1ldGFkYXRhUHVzaChmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfQ0hBTk5FTDpcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX0ZORjpcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVFVRVNUX1JFU1BPTlNFOlxuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfU1RSRUFNOlxuICAgICAgICAvLyBUT0RPICMxODA2NDcwNjogaGFuZGxlIHJlcXVlc3RzIGZyb20gc2VydmVyXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFU0VSVkVEOlxuICAgICAgICAvLyBOby1vcFxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVNVTUU6XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FX09LOlxuICAgICAgICAvLyBUT0RPICMxODA2NTAxNjogc3VwcG9ydCByZXN1bXB0aW9uXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAnUlNvY2tldENsaWVudDogVW5zdXBwb3J0ZWQgZnJhbWUgdHlwZSBgJXNgIG9uIHN0cmVhbSBgJXNgLicsXG4gICAgICAgICAgICAoMCwgX1JTb2NrZXRGcmFtZS5nZXRGcmFtZVR5cGVOYW1lKShmcmFtZS50eXBlKSxcbiAgICAgICAgICAgIF9SU29ja2V0RnJhbWUuQ09OTkVDVElPTl9TVFJFQU1fSURcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgc3RyZWFtLXNwZWNpZmljIGZyYW1lcyAoc3RyZWFtIGlkICE9PSAwKS5cbiAgICovXG4gIF9oYW5kbGVTdHJlYW1GcmFtZShzdHJlYW1JZCwgZnJhbWUpIHtcbiAgICBpZiAodGhpcy5faXNSZXF1ZXN0KGZyYW1lLnR5cGUpKSB7XG4gICAgICBjb25zdCBsZWFzZUVycm9yID0gdGhpcy5fdXNlTGVhc2VPckVycm9yKHRoaXMuX3Jlc3BvbmRlckxlYXNlSGFuZGxlcik7XG4gICAgICBpZiAobGVhc2VFcnJvcikge1xuICAgICAgICB0aGlzLl9zZW5kU3RyZWFtRXJyb3Ioc3RyZWFtSWQsIGxlYXNlRXJyb3IpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHN3aXRjaCAoZnJhbWUudHlwZSkge1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkNBTkNFTDpcbiAgICAgICAgdGhpcy5faGFuZGxlQ2FuY2VsKHN0cmVhbUlkLCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTjpcbiAgICAgICAgdGhpcy5faGFuZGxlUmVxdWVzdE4oc3RyZWFtSWQsIGZyYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9GTkY6XG4gICAgICAgIHRoaXMuX2hhbmRsZUZpcmVBbmRGb3JnZXQoc3RyZWFtSWQsIGZyYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVRVUVTVF9SRVNQT05TRTpcbiAgICAgICAgdGhpcy5faGFuZGxlUmVxdWVzdFJlc3BvbnNlKHN0cmVhbUlkLCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfU1RSRUFNOlxuICAgICAgICB0aGlzLl9oYW5kbGVSZXF1ZXN0U3RyZWFtKHN0cmVhbUlkLCBmcmFtZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfQ0hBTk5FTDpcbiAgICAgICAgdGhpcy5faGFuZGxlUmVxdWVzdENoYW5uZWwoc3RyZWFtSWQsIGZyYW1lKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuRVJST1I6XG4gICAgICAgIGNvbnN0IGVycm9yID0gKDAsIF9SU29ja2V0RnJhbWUuY3JlYXRlRXJyb3JGcm9tRnJhbWUpKGZyYW1lKTtcbiAgICAgICAgdGhpcy5faGFuZGxlU3RyZWFtRXJyb3Ioc3RyZWFtSWQsIGVycm9yKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUEFZTE9BRDpcbiAgICAgICAgY29uc3QgcmVjZWl2ZXIgPSB0aGlzLl9yZWNlaXZlcnMuZ2V0KHN0cmVhbUlkKTtcbiAgICAgICAgaWYgKHJlY2VpdmVyICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoKDAsIF9SU29ja2V0RnJhbWUuaXNOZXh0KShmcmFtZS5mbGFncykpIHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICAgICAgICAgIGRhdGE6IHRoaXMuX3NlcmlhbGl6ZXJzLmRhdGEuZGVzZXJpYWxpemUoZnJhbWUuZGF0YSksXG4gICAgICAgICAgICAgIG1ldGFkYXRhOiB0aGlzLl9zZXJpYWxpemVycy5tZXRhZGF0YS5kZXNlcmlhbGl6ZShmcmFtZS5tZXRhZGF0YSksXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZWNlaXZlci5vbk5leHQocGF5bG9hZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoMCwgX1JTb2NrZXRGcmFtZS5pc0NvbXBsZXRlKShmcmFtZS5mbGFncykpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlY2VpdmVycy5kZWxldGUoc3RyZWFtSWQpO1xuICAgICAgICAgICAgcmVjZWl2ZXIub25Db21wbGV0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgJ1JTb2NrZXRDbGllbnQ6IFVuc3VwcG9ydGVkIGZyYW1lIHR5cGUgYCVzYCBvbiBzdHJlYW0gYCVzYC4nLFxuICAgICAgICAgICAgKDAsIF9SU29ja2V0RnJhbWUuZ2V0RnJhbWVUeXBlTmFtZSkoZnJhbWUudHlwZSksXG4gICAgICAgICAgICBzdHJlYW1JZFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2hhbmRsZUNhbmNlbChzdHJlYW1JZCwgZnJhbWUpIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChzdHJlYW1JZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUoc3RyZWFtSWQpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVSZXF1ZXN0TihzdHJlYW1JZCwgZnJhbWUpIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9zdWJzY3JpcHRpb25zLmdldChzdHJlYW1JZCk7XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLnJlcXVlc3QoZnJhbWUucmVxdWVzdE4pO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVGaXJlQW5kRm9yZ2V0KHN0cmVhbUlkLCBmcmFtZSkge1xuICAgIGNvbnN0IHBheWxvYWQgPSB0aGlzLl9kZXNlcmlhbGl6ZVBheWxvYWQoZnJhbWUpO1xuICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyLmZpcmVBbmRGb3JnZXQocGF5bG9hZCk7XG4gIH1cblxuICBfaGFuZGxlUmVxdWVzdFJlc3BvbnNlKHN0cmVhbUlkLCBmcmFtZSkge1xuICAgIGNvbnN0IHBheWxvYWQgPSB0aGlzLl9kZXNlcmlhbGl6ZVBheWxvYWQoZnJhbWUpO1xuICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyLnJlcXVlc3RSZXNwb25zZShwYXlsb2FkKS5zdWJzY3JpYmUoe1xuICAgICAgb25Db21wbGV0ZTogKHBheWxvYWQpID0+IHtcbiAgICAgICAgdGhpcy5fc2VuZFN0cmVhbVBheWxvYWQoc3RyZWFtSWQsIHBheWxvYWQsIHRydWUpO1xuICAgICAgfSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcikgPT4gdGhpcy5fc2VuZFN0cmVhbUVycm9yKHN0cmVhbUlkLCBlcnJvci5tZXNzYWdlKSxcbiAgICAgIG9uU3Vic2NyaWJlOiAoY2FuY2VsKSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHtcbiAgICAgICAgICBjYW5jZWwsXG4gICAgICAgICAgcmVxdWVzdDogKCkgPT4ge30sXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQoc3RyZWFtSWQsIHN1YnNjcmlwdGlvbik7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVJlcXVlc3RTdHJlYW0oc3RyZWFtSWQsIGZyYW1lKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHRoaXMuX2Rlc2VyaWFsaXplUGF5bG9hZChmcmFtZSk7XG4gICAgdGhpcy5fcmVxdWVzdEhhbmRsZXIucmVxdWVzdFN0cmVhbShwYXlsb2FkKS5zdWJzY3JpYmUoe1xuICAgICAgb25Db21wbGV0ZTogKCkgPT4gdGhpcy5fc2VuZFN0cmVhbUNvbXBsZXRlKHN0cmVhbUlkKSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcikgPT4gdGhpcy5fc2VuZFN0cmVhbUVycm9yKHN0cmVhbUlkLCBlcnJvci5tZXNzYWdlKSxcbiAgICAgIG9uTmV4dDogKHBheWxvYWQpID0+IHRoaXMuX3NlbmRTdHJlYW1QYXlsb2FkKHN0cmVhbUlkLCBwYXlsb2FkKSxcbiAgICAgIG9uU3Vic2NyaWJlOiAoc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuc2V0KHN0cmVhbUlkLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChmcmFtZS5yZXF1ZXN0Tik7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVJlcXVlc3RDaGFubmVsKHN0cmVhbUlkLCBmcmFtZSkge1xuICAgIGNvbnN0IGV4aXN0aW5nU3Vic2NyaXB0aW9uID0gdGhpcy5fc3Vic2NyaXB0aW9ucy5nZXQoc3RyZWFtSWQpO1xuICAgIGlmIChleGlzdGluZ1N1YnNjcmlwdGlvbikge1xuICAgICAgLy9MaWtlbHkgYSBkdXBsaWNhdGUgUkVRVUVTVF9DSEFOTkVMIGZyYW1lLCBpZ25vcmUgcGVyIHNwZWNcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXlsb2FkcyA9IG5ldyBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBsZXQgZmlyc3RSZXF1ZXN0ID0gdHJ1ZTtcblxuICAgICAgc3Vic2NyaWJlci5vblN1YnNjcmliZSh7XG4gICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3JlY2VpdmVycy5kZWxldGUoc3RyZWFtSWQpO1xuICAgICAgICAgIGNvbnN0IGNhbmNlbEZyYW1lID0ge1xuICAgICAgICAgICAgZmxhZ3M6IDAsXG4gICAgICAgICAgICBzdHJlYW1JZCxcbiAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuQ0FOQ0VMLFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnNlbmRPbmUoY2FuY2VsRnJhbWUpO1xuICAgICAgICB9LFxuICAgICAgICByZXF1ZXN0OiAobikgPT4ge1xuICAgICAgICAgIGlmIChuID4gX1JTb2NrZXRGcmFtZS5NQVhfUkVRVUVTVF9OKSB7XG4gICAgICAgICAgICBuID0gX1JTb2NrZXRGcmFtZS5NQVhfUkVRVUVTVF9OO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZmlyc3RSZXF1ZXN0KSB7XG4gICAgICAgICAgICBuLS07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0TkZyYW1lID0ge1xuICAgICAgICAgICAgICBmbGFnczogMCxcbiAgICAgICAgICAgICAgcmVxdWVzdE46IG4sXG4gICAgICAgICAgICAgIHN0cmVhbUlkLFxuICAgICAgICAgICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlJFUVVFU1RfTixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZShyZXF1ZXN0TkZyYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jcml0aWNhbGx5LCBpZiBuIGlzIDAgbm93LCB0aGF0J3Mgb2theSBiZWNhdXNlIHdlIGVhZ2VybHkgZGVjcmVtZW50ZWQgaXRcbiAgICAgICAgICBpZiAoZmlyc3RSZXF1ZXN0ICYmIG4gPj0gMCkge1xuICAgICAgICAgICAgZmlyc3RSZXF1ZXN0ID0gZmFsc2U7XG4gICAgICAgICAgICAvL3JlbGVhc2UgdGhlIGluaXRpYWwgZnJhbWUgd2UgcmVjZWl2ZWQgaW4gZnJhbWUgZm9ybSBkdWUgdG8gbWFwIG9wZXJhdG9yXG4gICAgICAgICAgICBzdWJzY3JpYmVyLm9uTmV4dChmcmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSwgX1JTb2NrZXRGcmFtZS5NQVhfUkVRVUVTVF9OKTtcbiAgICBjb25zdCBmcmFtZXNUb1BheWxvYWRzID0gbmV3IF9yc29ja2V0Rmxvd2FibGUuRmxvd2FibGVQcm9jZXNzb3IoXG4gICAgICBwYXlsb2FkcyxcbiAgICAgIChmcmFtZSkgPT4gdGhpcy5fZGVzZXJpYWxpemVQYXlsb2FkKGZyYW1lKVxuICAgICk7XG5cbiAgICB0aGlzLl9yZWNlaXZlcnMuc2V0KHN0cmVhbUlkLCBmcmFtZXNUb1BheWxvYWRzKTtcblxuICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyLnJlcXVlc3RDaGFubmVsKGZyYW1lc1RvUGF5bG9hZHMpLnN1YnNjcmliZSh7XG4gICAgICBvbkNvbXBsZXRlOiAoKSA9PiB0aGlzLl9zZW5kU3RyZWFtQ29tcGxldGUoc3RyZWFtSWQpLFxuICAgICAgb25FcnJvcjogKGVycm9yKSA9PiB0aGlzLl9zZW5kU3RyZWFtRXJyb3Ioc3RyZWFtSWQsIGVycm9yLm1lc3NhZ2UpLFxuICAgICAgb25OZXh0OiAocGF5bG9hZCkgPT4gdGhpcy5fc2VuZFN0cmVhbVBheWxvYWQoc3RyZWFtSWQsIHBheWxvYWQpLFxuICAgICAgb25TdWJzY3JpYmU6IChzdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5zZXQoc3RyZWFtSWQsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5yZXF1ZXN0KGZyYW1lLnJlcXVlc3ROKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBfaGFuZGxlTWV0YWRhdGFQdXNoKGZyYW1lKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHRoaXMuX2Rlc2VyaWFsaXplTWV0YWRhdGFQdXNoUGF5bG9hZChmcmFtZSk7XG4gICAgdGhpcy5fcmVxdWVzdEhhbmRsZXIubWV0YWRhdGFQdXNoKHBheWxvYWQpLnN1YnNjcmliZSh7XG4gICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7fSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcikgPT4ge30sXG4gICAgICBvblN1YnNjcmliZTogKGNhbmNlbCkgPT4ge30sXG4gICAgfSk7XG4gIH1cblxuICBfc2VuZFN0cmVhbUNvbXBsZXRlKHN0cmVhbUlkKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUoc3RyZWFtSWQpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZSh7XG4gICAgICBkYXRhOiBudWxsLFxuICAgICAgZmxhZ3M6IF9SU29ja2V0RnJhbWUuRkxBR1MuQ09NUExFVEUsXG4gICAgICBtZXRhZGF0YTogbnVsbCxcbiAgICAgIHN0cmVhbUlkLFxuICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5QQVlMT0FELFxuICAgIH0pO1xuICB9XG5cbiAgX3NlbmRTdHJlYW1FcnJvcihzdHJlYW1JZCwgZXJyb3JNZXNzYWdlKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kZWxldGUoc3RyZWFtSWQpO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2VuZE9uZSh7XG4gICAgICBjb2RlOiBfUlNvY2tldEZyYW1lLkVSUk9SX0NPREVTLkFQUExJQ0FUSU9OX0VSUk9SLFxuICAgICAgZmxhZ3M6IDAsXG4gICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UsXG4gICAgICBzdHJlYW1JZCxcbiAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuRVJST1IsXG4gICAgfSk7XG5cbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgdGVybWluYXRlZCBmcm9tIHRoZSByZXF1ZXN0ZXI6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgIHRoaXMuX2hhbmRsZVN0cmVhbUVycm9yKHN0cmVhbUlkLCBlcnJvcik7XG4gIH1cblxuICBfc2VuZFN0cmVhbVBheWxvYWQoc3RyZWFtSWQsIHBheWxvYWQsIGNvbXBsZXRlID0gZmFsc2UpIHtcbiAgICBsZXQgZmxhZ3MgPSBfUlNvY2tldEZyYW1lLkZMQUdTLk5FWFQ7XG4gICAgaWYgKGNvbXBsZXRlKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuICAgICAgZmxhZ3MgfD0gX1JTb2NrZXRGcmFtZS5GTEFHUy5DT01QTEVURTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGVsZXRlKHN0cmVhbUlkKTtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuX3NlcmlhbGl6ZXJzLmRhdGEuc2VyaWFsaXplKHBheWxvYWQuZGF0YSk7XG4gICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLl9zZXJpYWxpemVycy5tZXRhZGF0YS5zZXJpYWxpemUocGF5bG9hZC5tZXRhZGF0YSk7XG4gICAgdGhpcy5fY29ubmVjdGlvbi5zZW5kT25lKHtcbiAgICAgIGRhdGEsXG4gICAgICBmbGFncyxcbiAgICAgIG1ldGFkYXRhLFxuICAgICAgc3RyZWFtSWQsXG4gICAgICB0eXBlOiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlBBWUxPQUQsXG4gICAgfSk7XG4gIH1cblxuICBfZGVzZXJpYWxpemVQYXlsb2FkKGZyYW1lKSB7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplUGF5bG9hZCh0aGlzLl9zZXJpYWxpemVycywgZnJhbWUpO1xuICB9XG5cbiAgX2Rlc2VyaWFsaXplTWV0YWRhdGFQdXNoUGF5bG9hZChmcmFtZSkge1xuICAgIHJldHVybiBkZXNlcmlhbGl6ZU1ldGFkYXRhUHVzaFBheWxvYWQodGhpcy5fc2VyaWFsaXplcnMsIGZyYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYW4gZXJyb3Igc3BlY2lmaWMgdG8gYSBzdHJlYW0uXG4gICAqL1xuICBfaGFuZGxlU3RyZWFtRXJyb3Ioc3RyZWFtSWQsIGVycm9yKSB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB0aGlzLl9yZWNlaXZlcnMuZ2V0KHN0cmVhbUlkKTtcbiAgICBpZiAocmVjZWl2ZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVjZWl2ZXJzLmRlbGV0ZShzdHJlYW1JZCk7XG4gICAgICByZWNlaXZlci5vbkVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVQYXlsb2FkKHNlcmlhbGl6ZXJzLCBmcmFtZSkge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IHNlcmlhbGl6ZXJzLmRhdGEuZGVzZXJpYWxpemUoZnJhbWUuZGF0YSksXG4gICAgbWV0YWRhdGE6IHNlcmlhbGl6ZXJzLm1ldGFkYXRhLmRlc2VyaWFsaXplKGZyYW1lLm1ldGFkYXRhKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVNZXRhZGF0YVB1c2hQYXlsb2FkKHNlcmlhbGl6ZXJzLCBmcmFtZSkge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IG51bGwsXG4gICAgbWV0YWRhdGE6IHNlcmlhbGl6ZXJzLm1ldGFkYXRhLmRlc2VyaWFsaXplKGZyYW1lLm1ldGFkYXRhKSxcbiAgfTtcbn1cbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcblxudmFyIF9yc29ja2V0Rmxvd2FibGUgPSByZXF1aXJlKCdyc29ja2V0LWZsb3dhYmxlJyk7XG52YXIgX0ludmFyaWFudCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9JbnZhcmlhbnQnKSk7XG52YXIgX1JTb2NrZXRGcmFtZSA9IHJlcXVpcmUoJy4vUlNvY2tldEZyYW1lJyk7XG5cbnZhciBfcnNvY2tldFR5cGVzID0gcmVxdWlyZSgncnNvY2tldC10eXBlcycpO1xuXG52YXIgX1JTb2NrZXRCaW5hcnlGcmFtaW5nID0gcmVxdWlyZSgnLi9SU29ja2V0QmluYXJ5RnJhbWluZycpO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuZnVuY3Rpb24gb3duS2V5cyhvYmplY3QsIGVudW1lcmFibGVPbmx5KSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtcbiAgICBpZiAoZW51bWVyYWJsZU9ubHkpXG4gICAgICBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bSkuZW51bWVyYWJsZTtcbiAgICAgIH0pO1xuICAgIGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTtcbiAgfVxuICByZXR1cm4ga2V5cztcbn1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG4gICAgaWYgKGkgJSAyKSB7XG4gICAgICBvd25LZXlzKE9iamVjdChzb3VyY2UpLCB0cnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgX2RlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBzb3VyY2Vba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHNvdXJjZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvd25LZXlzKE9iamVjdChzb3VyY2UpKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBOT1RFOiBUaGlzIGltcGxlbWVudGF0aW9uIGNvbmZvcm1zIHRvIGFuIHVwY29taW5nIHZlcnNpb24gb2YgdGhlIFJTb2NrZXQgcHJvdG9jb2xcbiAqICAgICAgIGFuZCB3aWxsIG5vdCB3b3JrIHdpdGggdmVyc2lvbiAxLjAgc2VydmVycy5cbiAqXG4gKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgRHVwbGV4Q29ubmVjdGlvbiBpbnRlcmZhY2UgdGhhdCBzdXBwb3J0cyBhdXRvbWF0aWNcbiAqIHJlc3VtcHRpb24gcGVyIHRoZSBSU29ja2V0IHByb3RvY29sLlxuICpcbiAqICMgRXhhbXBsZVxuICpcbiAqIENyZWF0ZSBhIGNsaWVudCBpbnN0YW5jZTpcbiAqIGBgYFxuICogY29uc3QgY2xpZW50ID0gbmV3IFJTb2NrZXRDbGllbnQoe1xuICogICAuLi4sXG4gKiAgIHRyYW5zcG9ydDogbmV3IFJTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQoXG4gKiAgICAgKCkgPT4gbmV3IFJTb2NrZXRXZWJTb2NrZXRDbGllbnQoLi4uKSwgLy8gcHJvdmlkZXIgZm9yIGxvdy1sZXZlbCB0cmFuc3BvcnQgaW5zdGFuY2VzXG4gKiAgICAge1xuICogICAgICAgYnVmZmVyU2l6ZTogMTAsIC8vIG1heCBudW1iZXIgb2Ygc2VudCAmIHBlbmRpbmcgZnJhbWVzIHRvIGJ1ZmZlciBiZWZvcmUgZmFpbGluZ1xuICogICAgICAgcmVzdW1lVG9rZW46ICdhYmMxMjMnLCAvLyBzdHJpbmcgdG8gdW5pcXVlbHkgaWRlbnRpZnkgdGhlIHNlc3Npb24gYWNyb3NzIGNvbm5lY3Rpb25zXG4gKiAgICAgfVxuICogICApLFxuICogfSlcbiAqXG4gKiBPcGVuIHRoZSBjb25uZWN0aW9uLiBBZnRlciB0aGlzIGlmIHRoZSBjb25uZWN0aW9uIGRpZXMgaXQgd2lsbCBiZSBhdXRvLXJlc3VtZWQ6XG4gKiBgYGBcbiAqIGNsaWVudC5jb25uZWN0KCkuc3Vic2NyaWJlKC4uLik7XG4gKiBgYGBcbiAqXG4gKiBPcHRpb25hbGx5LCBzdWJzY3JpYmUgdG8gdGhlIHN0YXR1cyBvZiB0aGUgY29ubmVjdGlvbjpcbiAqIGBgYFxuICogY2xpZW50LmNvbm5lY3Rpb25TdGF0dXMoKS5zdWJzY3JpYmUoLi4uKTtcbiAqIGBgYFxuICpcbiAqICMgSW1wbGVtZW50YXRpb24gTm90ZXNcbiAqXG4gKiBUaGlzIHRyYW5zcG9ydCBtYWludGFpbnM6XG4gKiAtIF9jdXJyZW50Q29ubmVjdGlvbjogYSBjdXJyZW50IGxvdy1sZXZlbCB0cmFuc3BvcnQsIHdoaWNoIGlzIG51bGwgd2hlbiBub3RcbiAqICAgY29ubmVjdGVkXG4gKiAtIF9zZW50RnJhbWVzOiBhIGJ1ZmZlciBvZiBmcmFtZXMgd3JpdHRlbiB0byBhIGxvdy1sZXZlbCB0cmFuc3BvcnQgKHdoaWNoXG4gKiAgIG1heSBvciBtYXkgbm90IGhhdmUgYmVlbiByZWNlaXZlZCBieSB0aGUgc2VydmVyKVxuICogLSBfcGVuZGluZ0ZyYW1lczogYSBidWZmZXIgb2YgZnJhbWVzIG5vdCB5ZXQgd3JpdHRlbiB0byB0aGUgbG93LWxldmVsXG4gKiAgIGNvbm5lY3Rpb24sIGJlY2F1c2UgdGhleSB3ZXJlIHNlbnQgd2hpbGUgbm90IGNvbm5lY3RlZC5cbiAqXG4gKiBUaGUgaW5pdGlhbCBjb25uZWN0aW9uIGlzIHNpbXBsZTogY29ubmVjdCB1c2luZyB0aGUgbG93LWxldmVsIHRyYW5zcG9ydCBhbmRcbiAqIGZsdXNoIGFueSBfcGVuZGluZ0ZyYW1lcyAod3JpdGUgdGhlbSBhbmQgYWRkIHRoZW0gdG8gX3NlbnRGcmFtZXMpLlxuICpcbiAqIFRoZXJlYWZ0ZXIgaWYgdGhlIGxvdy1sZXZlbCB0cmFuc3BvcnQgZHJvcHMsIHRoaXMgdHJhbnNwb3J0IGF0dGVtcHRzIHJlc3VtcHRpb24uXG4gKiBJdCBvYnRhaW5zIGEgZnJlc2ggbG93LWxldmVsIHRyYW5zcG9ydCBmcm9tIHRoZSBnaXZlbiB0cmFuc3BvcnQgYHNvdXJjZWBcbiAqIGFuZCBhdHRlbXB0cyB0byBjb25uZWN0LiBPbmNlIGNvbm5lY3RlZCwgaXQgc2VuZHMgYSBSRVNVTUUgZnJhbWUgYW5kIHdhaXRzLlxuICogSWYgUkVTVU1FX09LIGlzIHJlY2VpdmVkLCBfc2VudEZyYW1lcyBhbmQgX3BlbmRpbmdGcmFtZXMgYXJlIGFkanVzdGVkIHN1Y2hcbiAqIHRoYXQ6XG4gKiAtIGFueSBmcmFtZXMgdGhlIHNlcnZlciBoYXMgcmVjZWl2ZWQgYXJlIHJlbW92ZWQgZnJvbSBfc2VudEZyYW1lc1xuICogLSB0aGUgcmVtYWluaW5nIGZyYW1lcyBhcmUgbWVyZ2VkIChpbiBjb3JyZWN0IG9yZGVyKSBpbnRvIF9wZW5kaW5nRnJhbWVzXG4gKlxuICogVGhlbiB0aGUgY29ubmVjdGlvbiBwcm9jZWVkcyBhcyBhYm92ZSwgd2hlcmUgYWxsIHBlbmRpbmcgZnJhbWVzIGFyZSBmbHVzaGVkLlxuICogSWYgYW55dGhpbmcgb3RoZXIgdGhhbiBSRVNVTUVfT0sgaXMgcmVjZWl2ZWQsIHJlc3VtcHRpb24gaXMgY29uc2lkZXJlZCB0b1xuICogaGF2ZSBmYWlsZWQgYW5kIHRoZSBjb25uZWN0aW9uIGlzIHNldCB0byB0aGUgRVJST1Igc3RhdHVzLlxuICovXG5jbGFzcyBSU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0IHtcbiAgY29uc3RydWN0b3Ioc291cmNlLCBvcHRpb25zLCBlbmNvZGVycykge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgb3B0aW9ucy5idWZmZXJTaXplID49IDAsXG4gICAgICAnUlNvY2tldFJlc3VtYWJsZVRyYW5zcG9ydDogYnVmZmVyU2l6ZSBvcHRpb24gbXVzdCBiZSA+PSAwLCBnb3QgYCVzYC4nLFxuICAgICAgb3B0aW9ucy5idWZmZXJTaXplXG4gICAgKTtcblxuICAgIHRoaXMuX2VuY29kZXJzID0gZW5jb2RlcnM7XG4gICAgdGhpcy5fYnVmZmVyU2l6ZSA9IG9wdGlvbnMuYnVmZmVyU2l6ZTtcbiAgICB0aGlzLl9zZW50RnJhbWVzU2l6ZSA9IDA7XG4gICAgdGhpcy5fcG9zaXRpb24gPSB7XG4gICAgICBjbGllbnQ6IDAsXG4gICAgICBzZXJ2ZXI6IDAsXG4gICAgfTtcblxuICAgIHRoaXMuX2N1cnJlbnRDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX3JlY2VpdmVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX3JlY2VpdmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9yZXN1bWVUb2tlbiA9IG9wdGlvbnMucmVzdW1lVG9rZW47XG4gICAgdGhpcy5fc2Vzc2lvblRpbWVvdXRNaWxsaXMgPSBvcHRpb25zLnNlc3Npb25EdXJhdGlvblNlY29uZHMgKiAxMDAwO1xuICAgIHRoaXMuX3Nlc3Npb25UaW1lb3V0SGFuZGxlID0gbnVsbDtcbiAgICB0aGlzLl9zZW5kZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3NlbnRGcmFtZXMgPSBbXTtcbiAgICB0aGlzLl9zZXR1cEZyYW1lID0gbnVsbDtcbiAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy5fc3RhdHVzID0gX3Jzb2NrZXRUeXBlcy5DT05ORUNUSU9OX1NUQVRVUy5OT1RfQ09OTkVDVEVEO1xuICAgIHRoaXMuX3N0YXR1c1N1YnNjcmliZXJzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICAhdGhpcy5faXNUZXJtaW5hdGVkKCksXG4gICAgICAnUlNvY2tldFJlc3VtYWJsZVRyYW5zcG9ydDogQ2Fubm90IGNvbm5lY3QoKSwgY29ubmVjdGlvbiB0ZXJtaW5hdGVkICglczogJXMpLicsXG4gICAgICB0aGlzLl9zdGF0dXMua2luZCxcbiAgICAgIHRoaXMuX3N0YXR1cy5raW5kID09PSAnRVJST1InID8gdGhpcy5fc3RhdHVzLmVycm9yLm1lc3NhZ2UgOiAnbm8gbWVzc2FnZSdcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgIHRoaXMuX3JlY2VpdmVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIHRoaXMuX3NldENvbm5lY3Rpb25TdGF0dXMoX3Jzb2NrZXRUeXBlcy5DT05ORUNUSU9OX1NUQVRVUy5DT05ORUNUSU5HKTtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLl9zb3VyY2UoKTtcbiAgICAgIGNvbm5lY3Rpb24uY29ubmVjdGlvblN0YXR1cygpLnN1YnNjcmliZSh7XG4gICAgICAgIG9uTmV4dDogKHN0YXR1cykgPT4ge1xuICAgICAgICAgIGlmIChzdGF0dXMua2luZCA9PT0gdGhpcy5fc3RhdHVzLmtpbmQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0YXR1cy5raW5kID09PSAnQ09OTkVDVEVEJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Nlc3Npb25UaW1lb3V0SGFuZGxlKSB7XG4gICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9zZXNzaW9uVGltZW91dEhhbmRsZSk7XG4gICAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25UaW1lb3V0SGFuZGxlID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vU2V0dXBcbiAgICAgICAgICAgIGlmICh0aGlzLl9zZXR1cEZyYW1lID09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ29ubmVjdGVkKGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgICAvL1Jlc3VtZVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5faGFuZGxlUmVzdW1lKGNvbm5lY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNUZXJtaW5hdGlvblN0YXR1cyhzdGF0dXMpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3Nlc3Npb25UaW1lb3V0SGFuZGxlKSB7XG4gICAgICAgICAgICAgIHRoaXMuX3Nlc3Npb25UaW1lb3V0SGFuZGxlID0gc2V0VGltZW91dChcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLl9jbG9zZSh0aGlzLl9yZXN1bWVUaW1lb3V0RXJyb3IoKSksXG4gICAgICAgICAgICAgICAgdGhpcy5fc2Vzc2lvblRpbWVvdXRNaWxsaXNcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2Rpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgIHRoaXMuX3NldENvbm5lY3Rpb25TdGF0dXMoXG4gICAgICAgICAgICAgIF9yc29ja2V0VHlwZXMuQ09OTkVDVElPTl9TVEFUVVMuTk9UX0NPTk5FQ1RFRFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uU3Vic2NyaWJlOiAoc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5yZXF1ZXN0KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25uZWN0aW9uLmNvbm5lY3QoKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5fY2xvc2UoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3Rpb25TdGF0dXMoKSB7XG4gICAgcmV0dXJuIG5ldyBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKHtcbiAgICAgICAgY2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaWJlcnMuZGVsZXRlKHN1YnNjcmliZXIpO1xuICAgICAgICB9LFxuICAgICAgICByZXF1ZXN0OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaWJlcnMuYWRkKHN1YnNjcmliZXIpO1xuICAgICAgICAgIHN1YnNjcmliZXIub25OZXh0KHRoaXMuX3N0YXR1cyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlY2VpdmUoKSB7XG4gICAgcmV0dXJuIG5ldyBfcnNvY2tldEZsb3dhYmxlLkZsb3dhYmxlKChzdWJqZWN0KSA9PiB7XG4gICAgICBsZXQgYWRkZWQgPSBmYWxzZTtcbiAgICAgIHN1YmplY3Qub25TdWJzY3JpYmUoe1xuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9yZWNlaXZlcnMuZGVsZXRlKHN1YmplY3QpO1xuICAgICAgICB9LFxuICAgICAgICByZXF1ZXN0OiAoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhZGRlZCkge1xuICAgICAgICAgICAgYWRkZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fcmVjZWl2ZXJzLmFkZChzdWJqZWN0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmRPbmUoZnJhbWUpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fd3JpdGVGcmFtZShmcmFtZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuX2Nsb3NlKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBzZW5kKGZyYW1lcykge1xuICAgIGxldCBzdWJzY3JpcHRpb247XG4gICAgZnJhbWVzLnN1YnNjcmliZSh7XG4gICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgIHN1YnNjcmlwdGlvbiAmJiB0aGlzLl9zZW5kZXJzLmRlbGV0ZShzdWJzY3JpcHRpb24pO1xuICAgICAgfSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcikgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24gJiYgdGhpcy5fc2VuZGVycy5kZWxldGUoc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fY2xvc2UoZXJyb3IpO1xuICAgICAgfSxcbiAgICAgIG9uTmV4dDogKGZyYW1lKSA9PiB0aGlzLl93cml0ZUZyYW1lKGZyYW1lKSxcbiAgICAgIG9uU3Vic2NyaWJlOiAoX3N1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24gPSBfc3Vic2NyaXB0aW9uO1xuICAgICAgICB0aGlzLl9zZW5kZXJzLmFkZChzdWJzY3JpcHRpb24pO1xuICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgX2Nsb3NlKGVycm9yKSB7XG4gICAgaWYgKHRoaXMuX2lzVGVybWluYXRlZCgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhpcy5fc2V0Q29ubmVjdGlvblN0YXR1cyh7ZXJyb3IsIGtpbmQ6ICdFUlJPUid9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2V0Q29ubmVjdGlvblN0YXR1cyhfcnNvY2tldFR5cGVzLkNPTk5FQ1RJT05fU1RBVFVTLkNMT1NFRCk7XG4gICAgfVxuICAgIGNvbnN0IHJlY2VpdmVycyA9IHRoaXMuX3JlY2VpdmVycztcbiAgICByZWNlaXZlcnMuZm9yRWFjaCgocikgPT4gci5vbkNvbXBsZXRlKCkpO1xuICAgIHJlY2VpdmVycy5jbGVhcigpO1xuXG4gICAgY29uc3Qgc2VuZGVycyA9IHRoaXMuX3NlbmRlcnM7XG4gICAgc2VuZGVycy5mb3JFYWNoKChzKSA9PiBzLmNhbmNlbCgpKTtcbiAgICBzZW5kZXJzLmNsZWFyKCk7XG4gICAgdGhpcy5fc2VudEZyYW1lcy5sZW5ndGggPSAwO1xuXG4gICAgdGhpcy5fZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgX2Rpc2Nvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuX3N0YXR1c1N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgICAgdGhpcy5fc3RhdHVzU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3JlY2VpdmVTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3JlY2VpdmVTdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICB0aGlzLl9yZWNlaXZlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9jdXJyZW50Q29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgdGhpcy5fY3VycmVudENvbm5lY3Rpb24gPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVDb25uZWN0ZWQoY29ubmVjdGlvbikge1xuICAgIHRoaXMuX2N1cnJlbnRDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICB0aGlzLl9mbHVzaEZyYW1lcygpO1xuICAgIHRoaXMuX3NldENvbm5lY3Rpb25TdGF0dXMoX3Jzb2NrZXRUeXBlcy5DT05ORUNUSU9OX1NUQVRVUy5DT05ORUNURUQpO1xuICAgIGNvbm5lY3Rpb24ucmVjZWl2ZSgpLnN1YnNjcmliZSh7XG4gICAgICBvbk5leHQ6IChmcmFtZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuX3JlY2VpdmVGcmFtZShmcmFtZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgdGhpcy5fY2xvc2UoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25TdWJzY3JpYmU6IChzdWJzY3JpcHRpb24pID0+IHtcbiAgICAgICAgdGhpcy5fcmVjZWl2ZVN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbjtcbiAgICAgICAgc3Vic2NyaXB0aW9uLnJlcXVlc3QoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVSZXN1bWUoY29ubmVjdGlvbikge1xuICAgIGNvbm5lY3Rpb25cbiAgICAgIC5yZWNlaXZlKClcbiAgICAgIC50YWtlKDEpXG4gICAgICAuc3Vic2NyaWJlKHtcbiAgICAgICAgb25OZXh0OiAoZnJhbWUpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGZyYW1lLnR5cGUgPT09IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuUkVTVU1FX09LKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHtjbGllbnRQb3NpdGlvbn0gPSBmcmFtZTtcbiAgICAgICAgICAgICAgLy8gY2xpZW50UG9zaXRpb24gaW5kaWNhdGVzIHdoaWNoIGZyYW1lcyB0aGUgc2VydmVyIGlzIG1pc3Npbmc6XG4gICAgICAgICAgICAgIC8vIC0gYW55dGhpbmcgYWZ0ZXIgdGhhdCBzdGlsbCBuZWVkcyB0byBiZSBzZW50XG4gICAgICAgICAgICAgIC8vIC0gYW55dGhpbmcgYmVmb3JlIHRoYXQgY2FuIGJlIGRpc2NhcmRlZFxuICAgICAgICAgICAgICBpZiAoY2xpZW50UG9zaXRpb24gPCB0aGlzLl9wb3NpdGlvbi5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBJbnZhbGlkIFJFU1VNRV9PSyBmcmFtZTogc2VydmVyIGFza2VkIGZvciBhbiBvbGRlclxuICAgICAgICAgICAgICAgIC8vIGNsaWVudCBmcmFtZSB0aGFuIGlzIGF2YWlsYWJsZVxuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlKHRoaXMuX25vblJlc3VtYWJsZVN0YXRlRXJyb3IoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIHJlbW92ZSB0YWlsIGZyYW1lcyBvZiB0b3RhbCBsZW5ndGggPSByZW1vdGVJbXBsaWVkUG9zLWxvY2FsUG9zXG4gICAgICAgICAgICAgIGxldCByZW1vdmVTaXplID0gY2xpZW50UG9zaXRpb24gLSB0aGlzLl9wb3NpdGlvbi5jbGllbnQ7XG4gICAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgICAgICAgIHdoaWxlIChyZW1vdmVTaXplID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMuX29uUmVsZWFzZWRUYWlsRnJhbWUoXG4gICAgICAgICAgICAgICAgICB0aGlzLl9zZW50RnJhbWVzW2luZGV4XVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWZyYW1lU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgdGhpcy5fY2xvc2UodGhpcy5fYWJzZW50TGVuZ3RoRXJyb3IoZnJhbWUpKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVtb3ZlU2l6ZSAtPSBmcmFtZVNpemU7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVtb3ZlU2l6ZSAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nsb3NlKHRoaXMuX2luY29uc2lzdGVudEltcGxpZWRQb3NpdGlvbkVycm9yKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBEcm9wIHNlbnQgZnJhbWVzIHRoYXQgdGhlIHNlcnZlciBoYXMgcmVjZWl2ZWRcbiAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlbnRGcmFtZXMuc3BsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBDb250aW51ZSBjb25uZWN0aW5nLCB3aGljaCB3aWxsIGZsdXNoIHBlbmRpbmcgZnJhbWVzXG4gICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNvbm5lY3RlZChjb25uZWN0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgICAgICAgICBmcmFtZS50eXBlID09PSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkVSUk9SXG4gICAgICAgICAgICAgICAgICA/ICgwLCBfUlNvY2tldEZyYW1lLmNyZWF0ZUVycm9yRnJvbUZyYW1lKShmcmFtZSlcbiAgICAgICAgICAgICAgICAgIDogbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICdSU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0OiBSZXN1bXB0aW9uIGZhaWxlZCBmb3IgYW4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAndW5zcGVjaWZpZWQgcmVhc29uLidcbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICB0aGlzLl9jbG9zZShlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuX2Nsb3NlKGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9uU3Vic2NyaWJlOiAoc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgICAgdGhpcy5fcmVjZWl2ZVN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbjtcbiAgICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdCgxKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgY29uc3Qgc2V0dXBGcmFtZSA9IHRoaXMuX3NldHVwRnJhbWU7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkoXG4gICAgICBzZXR1cEZyYW1lLFxuICAgICAgJ1JTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQ6IENhbm5vdCByZXN1bWUsIHNldHVwIGZyYW1lIGhhcyBub3QgYmVlbiBzZW50LidcbiAgICApO1xuXG4gICAgY29ubmVjdGlvbi5zZW5kT25lKHtcbiAgICAgIGNsaWVudFBvc2l0aW9uOiB0aGlzLl9wb3NpdGlvbi5jbGllbnQsXG4gICAgICBmbGFnczogMCxcbiAgICAgIG1ham9yVmVyc2lvbjogc2V0dXBGcmFtZS5tYWpvclZlcnNpb24sXG4gICAgICBtaW5vclZlcnNpb246IHNldHVwRnJhbWUubWlub3JWZXJzaW9uLFxuICAgICAgcmVzdW1lVG9rZW46IHRoaXMuX3Jlc3VtZVRva2VuLFxuICAgICAgc2VydmVyUG9zaXRpb246IHRoaXMuX3Bvc2l0aW9uLnNlcnZlcixcbiAgICAgIHN0cmVhbUlkOiBfUlNvY2tldEZyYW1lLkNPTk5FQ1RJT05fU1RSRUFNX0lELFxuICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVNVTUUsXG4gICAgfSk7XG4gIH1cblxuICBfYWJzZW50TGVuZ3RoRXJyb3IoZnJhbWUpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKFxuICAgICAgJ1JTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQ6IGFic2VudCBmcmFtZS5sZW5ndGggZm9yIHR5cGUgJyArIGZyYW1lLnR5cGVcbiAgICApO1xuICB9XG5cbiAgX2luY29uc2lzdGVudEltcGxpZWRQb3NpdGlvbkVycm9yKCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoXG4gICAgICAnUlNvY2tldFJlc3VtYWJsZVRyYW5zcG9ydDogbG9jYWwgZnJhbWVzIGFyZSBpbmNvbnNpc3RlbnQgd2l0aCByZW1vdGUgaW1wbGllZCBwb3NpdGlvbidcbiAgICApO1xuICB9XG5cbiAgX25vblJlc3VtYWJsZVN0YXRlRXJyb3IoKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihcbiAgICAgICdSU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0OiByZXN1bXB0aW9uIGZhaWxlZCwgc2VydmVyIGlzICcgK1xuICAgICAgICAnbWlzc2luZyBmcmFtZXMgdGhhdCBhcmUgbm8gbG9uZ2VyIGluIHRoZSBjbGllbnQgYnVmZmVyLidcbiAgICApO1xuICB9XG5cbiAgX3Jlc3VtZVRpbWVvdXRFcnJvcigpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKCdSU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0OiByZXN1bWFibGUgc2Vzc2lvbiB0aW1lZCBvdXQnKTtcbiAgfVxuXG4gIF9pc1Rlcm1pbmF0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzVGVybWluYXRpb25TdGF0dXModGhpcy5fc3RhdHVzKTtcbiAgfVxuXG4gIF9pc1Rlcm1pbmF0aW9uU3RhdHVzKHN0YXR1cykge1xuICAgIGNvbnN0IGtpbmQgPSBzdGF0dXMua2luZDtcbiAgICByZXR1cm4ga2luZCA9PT0gJ0NMT1NFRCcgfHwga2luZCA9PT0gJ0VSUk9SJztcbiAgfVxuXG4gIF9zZXRDb25uZWN0aW9uU3RhdHVzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMua2luZCA9PT0gdGhpcy5fc3RhdHVzLmtpbmQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzO1xuICAgIHRoaXMuX3N0YXR1c1N1YnNjcmliZXJzLmZvckVhY2goKHN1YnNjcmliZXIpID0+IHN1YnNjcmliZXIub25OZXh0KHN0YXR1cykpO1xuICB9XG5cbiAgX3JlY2VpdmVGcmFtZShmcmFtZSkge1xuICAgIGlmICgoMCwgX1JTb2NrZXRGcmFtZS5pc1Jlc3VtZVBvc2l0aW9uRnJhbWVUeXBlKShmcmFtZS50eXBlKSkge1xuICAgICAgaWYgKGZyYW1lLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9wb3NpdGlvbi5zZXJ2ZXIgKz0gZnJhbWUubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBUT0RPOiB0cmltIF9zZW50RnJhbWVzIG9uIEtFRVBBTElWRSBmcmFtZVxuICAgIHRoaXMuX3JlY2VpdmVycy5mb3JFYWNoKChzdWJzY3JpYmVyKSA9PiBzdWJzY3JpYmVyLm9uTmV4dChmcmFtZSkpO1xuICB9XG5cbiAgX2ZsdXNoRnJhbWVzKCkge1xuICAgIHRoaXMuX3NlbnRGcmFtZXMuZm9yRWFjaCgoZnJhbWUpID0+IHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSB0aGlzLl9jdXJyZW50Q29ubmVjdGlvbjtcbiAgICAgIGlmIChjb25uZWN0aW9uKSB7XG4gICAgICAgIGNvbm5lY3Rpb24uc2VuZE9uZShmcmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfb25SZWxlYXNlZFRhaWxGcmFtZShmcmFtZSkge1xuICAgIGNvbnN0IHJlbW92ZWRGcmFtZVNpemUgPSBmcmFtZS5sZW5ndGg7XG4gICAgaWYgKHJlbW92ZWRGcmFtZVNpemUpIHtcbiAgICAgIHRoaXMuX3NlbnRGcmFtZXNTaXplIC09IHJlbW92ZWRGcmFtZVNpemU7XG4gICAgICB0aGlzLl9wb3NpdGlvbi5jbGllbnQgKz0gcmVtb3ZlZEZyYW1lU2l6ZTtcbiAgICAgIHJldHVybiByZW1vdmVkRnJhbWVTaXplO1xuICAgIH1cbiAgfVxuXG4gIF93cml0ZUZyYW1lKGZyYW1lKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgU0VUVVAgZnJhbWVzIGNvbnRhaW4gdGhlIHJlc3VtZSB0b2tlblxuICAgIGlmIChmcmFtZS50eXBlID09PSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLlNFVFVQKSB7XG4gICAgICBmcmFtZSA9IF9vYmplY3RTcHJlYWQoXG4gICAgICAgIF9vYmplY3RTcHJlYWQoe30sIGZyYW1lKSxcbiAgICAgICAge30sXG4gICAgICAgIHtcbiAgICAgICAgICBmbGFnczogZnJhbWUuZmxhZ3MgfCBfUlNvY2tldEZyYW1lLkZMQUdTLlJFU1VNRV9FTkFCTEUsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYml0d2lzZVxuICAgICAgICAgIHJlc3VtZVRva2VuOiB0aGlzLl9yZXN1bWVUb2tlbixcbiAgICAgICAgfVxuICAgICAgKTtcblxuICAgICAgdGhpcy5fc2V0dXBGcmFtZSA9IGZyYW1lOyAvLyBmcmFtZSBjYW4gb25seSBiZSBhIFNldHVwRnJhbWVcbiAgICB9XG4gICAgZnJhbWUubGVuZ3RoID0gKDAsIF9SU29ja2V0QmluYXJ5RnJhbWluZy5zaXplT2ZGcmFtZSkoXG4gICAgICBmcmFtZSxcbiAgICAgIHRoaXMuX2VuY29kZXJzXG4gICAgKTtcbiAgICAvLyBJZiBjb25uZWN0ZWQsIGltbWVkaWF0ZWx5IHdyaXRlIGZyYW1lcyB0byB0aGUgbG93LWxldmVsIHRyYW5zcG9ydFxuICAgIC8vIGFuZCBjb25zaWRlciB0aGVtIFwic2VudFwiLiBUaGUgcmVzdW1wdGlvbiBwcm90b2NvbCB3aWxsIGZpZ3VyZSBvdXRcbiAgICAvLyB3aGljaCBmcmFtZXMgbWF5IG5vdCBoYXZlIGJlZW4gcmVjZWl2ZWQgYW5kIHJlY292ZXIuXG4gICAgaWYgKCgwLCBfUlNvY2tldEZyYW1lLmlzUmVzdW1lUG9zaXRpb25GcmFtZVR5cGUpKGZyYW1lLnR5cGUpKSB7XG4gICAgICBsZXQgYXZhaWxhYmxlID0gdGhpcy5fYnVmZmVyU2l6ZSAtIHRoaXMuX3NlbnRGcmFtZXNTaXplO1xuICAgICAgY29uc3QgZnJhbWVTaXplID0gZnJhbWUubGVuZ3RoO1xuICAgICAgaWYgKGZyYW1lU2l6ZSkge1xuICAgICAgICAvLyByZW1vdmUgdGFpbCB1bnRpbCB0aGVyZSBpcyBzcGFjZSBmb3IgbmV3IGZyYW1lXG4gICAgICAgIHdoaWxlIChhdmFpbGFibGUgPCBmcmFtZVNpemUpIHtcbiAgICAgICAgICBjb25zdCByZW1vdmVkRnJhbWUgPSB0aGlzLl9zZW50RnJhbWVzLnNoaWZ0KCk7XG4gICAgICAgICAgaWYgKHJlbW92ZWRGcmFtZSkge1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlZEZyYW1lU2l6ZSA9IHRoaXMuX29uUmVsZWFzZWRUYWlsRnJhbWUocmVtb3ZlZEZyYW1lKTtcbiAgICAgICAgICAgIGlmICghcmVtb3ZlZEZyYW1lU2l6ZSkge1xuICAgICAgICAgICAgICB0aGlzLl9jbG9zZSh0aGlzLl9hYnNlbnRMZW5ndGhFcnJvcihmcmFtZSkpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdmFpbGFibGUgKz0gcmVtb3ZlZEZyYW1lU2l6ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChhdmFpbGFibGUgPj0gZnJhbWVTaXplKSB7XG4gICAgICAgICAgdGhpcy5fc2VudEZyYW1lcy5wdXNoKGZyYW1lKTtcbiAgICAgICAgICB0aGlzLl9zZW50RnJhbWVzU2l6ZSArPSBmcmFtZVNpemU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcG9zaXRpb24uY2xpZW50ICs9IGZyYW1lU2l6ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fY2xvc2UodGhpcy5fYWJzZW50TGVuZ3RoRXJyb3IoZnJhbWUpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBjdXJyZW50Q29ubmVjdGlvbiA9IHRoaXMuX2N1cnJlbnRDb25uZWN0aW9uO1xuICAgIGlmIChjdXJyZW50Q29ubmVjdGlvbikge1xuICAgICAgY3VycmVudENvbm5lY3Rpb24uc2VuZE9uZShmcmFtZSk7XG4gICAgfVxuICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBSU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0O1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuSWRlbnRpdHlTZXJpYWxpemVycyA9IGV4cG9ydHMuSWRlbnRpdHlTZXJpYWxpemVyID0gZXhwb3J0cy5Kc29uU2VyaWFsaXplcnMgPSBleHBvcnRzLkpzb25TZXJpYWxpemVyID0gdm9pZCAwO1xuXG52YXIgX0xpdGVCdWZmZXIgPSByZXF1aXJlKCcuL0xpdGVCdWZmZXInKTtcbnZhciBfSW52YXJpYW50ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL0ludmFyaWFudCcpKTtcbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cblxuLy8gSlNPTiBzZXJpYWxpemVyXG5jb25zdCBKc29uU2VyaWFsaXplciA9IHtcbiAgZGVzZXJpYWxpemU6IChkYXRhKSA9PiB7XG4gICAgbGV0IHN0cjtcbiAgICBpZiAoZGF0YSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgICAgc3RyID0gZGF0YTtcbiAgICB9IGVsc2UgaWYgKF9MaXRlQnVmZmVyLkxpdGVCdWZmZXIuaXNCdWZmZXIoZGF0YSkpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGRhdGE7XG4gICAgICBzdHIgPSBidWZmZXIudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYnVmZmVyID0gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5mcm9tKGRhdGEpO1xuICAgICAgc3RyID0gYnVmZmVyLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0cik7XG4gIH0sXG4gIHNlcmlhbGl6ZTogSlNPTi5zdHJpbmdpZnksXG59O1xuZXhwb3J0cy5Kc29uU2VyaWFsaXplciA9IEpzb25TZXJpYWxpemVyO1xuXG5jb25zdCBKc29uU2VyaWFsaXplcnMgPSB7XG4gIGRhdGE6IEpzb25TZXJpYWxpemVyLFxuICBtZXRhZGF0YTogSnNvblNlcmlhbGl6ZXIsXG59O1xuXG4vLyBQYXNzLXRocm91Z2ggc2VyaWFsaXplclxuZXhwb3J0cy5Kc29uU2VyaWFsaXplcnMgPSBKc29uU2VyaWFsaXplcnM7XG5jb25zdCBJZGVudGl0eVNlcmlhbGl6ZXIgPSB7XG4gIGRlc2VyaWFsaXplOiAoZGF0YSkgPT4ge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgZGF0YSA9PSBudWxsIHx8XG4gICAgICAgIHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJyB8fFxuICAgICAgICBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICAgIGRhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5LFxuICAgICAgJ1JTb2NrZXRTZXJpYWxpemF0aW9uOiBFeHBlY3RlZCBkYXRhIHRvIGJlIGEgc3RyaW5nLCBCdWZmZXIsIG9yICcgK1xuICAgICAgICAnVWludDhBcnJheS4gR290IGAlc2AuJyxcbiAgICAgIGRhdGFcbiAgICApO1xuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH0sXG4gIHNlcmlhbGl6ZTogKGRhdGEpID0+IGRhdGEsXG59O1xuZXhwb3J0cy5JZGVudGl0eVNlcmlhbGl6ZXIgPSBJZGVudGl0eVNlcmlhbGl6ZXI7XG5cbmNvbnN0IElkZW50aXR5U2VyaWFsaXplcnMgPSB7XG4gIGRhdGE6IElkZW50aXR5U2VyaWFsaXplcixcbiAgbWV0YWRhdGE6IElkZW50aXR5U2VyaWFsaXplcixcbn07XG5leHBvcnRzLklkZW50aXR5U2VyaWFsaXplcnMgPSBJZGVudGl0eVNlcmlhbGl6ZXJzO1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX3Jzb2NrZXRGbG93YWJsZSA9IHJlcXVpcmUoJ3Jzb2NrZXQtZmxvd2FibGUnKTtcbnZhciBfSW52YXJpYW50ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL0ludmFyaWFudCcpKTtcbnZhciBfUlNvY2tldEZyYW1lID0gcmVxdWlyZSgnLi9SU29ja2V0RnJhbWUnKTtcblxudmFyIF9SU29ja2V0U2VyaWFsaXphdGlvbiA9IHJlcXVpcmUoJy4vUlNvY2tldFNlcmlhbGl6YXRpb24nKTtcbnZhciBfUlNvY2tldE1hY2hpbmUgPSByZXF1aXJlKCcuL1JTb2NrZXRNYWNoaW5lJyk7XG52YXIgX1JTb2NrZXRMZWFzZSA9IHJlcXVpcmUoJy4vUlNvY2tldExlYXNlJyk7XG5cbnZhciBfUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb24gPSByZXF1aXJlKCcuL1JlYXNzZW1ibHlEdXBsZXhDb25uZWN0aW9uJyk7XG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge2RlZmF1bHQ6IG9ian07XG59XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFJTb2NrZXRTZXJ2ZXI6IEEgc2VydmVyIGluIGFuIFJTb2NrZXQgY29ubmVjdGlvbiB0aGF0IGFjY2VwdHMgY29ubmVjdGlvbnNcbiAqIGZyb20gcGVlcnMgdmlhIHRoZSBnaXZlbiB0cmFuc3BvcnQgc2VydmVyLlxuICovXG5jbGFzcyBSU29ja2V0U2VydmVyIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgX2RlZmluZVByb3BlcnR5KFxuICAgICAgdGhpcyxcbiAgICAgICdfaGFuZGxlVHJhbnNwb3J0Q29tcGxldGUnLFxuXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZVRyYW5zcG9ydEVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcignUlNvY2tldFNlcnZlcjogQ29ubmVjdGlvbiBjbG9zZWQgdW5leHBlY3RlZGx5LicpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoXG4gICAgICB0aGlzLFxuICAgICAgJ19oYW5kbGVUcmFuc3BvcnRFcnJvcicsXG5cbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9ucy5mb3JFYWNoKChjb25uZWN0aW9uKSA9PiB7XG4gICAgICAgICAgLy8gVE9ETzogQWxsb3cgcGFzc2luZyBpbiBlcnJvclxuICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoXG4gICAgICB0aGlzLFxuICAgICAgJ19oYW5kbGVUcmFuc3BvcnRDb25uZWN0aW9uJyxcblxuICAgICAgKGNvbm5lY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3Qgc3dhcHBlciA9IG5ldyBTdWJzY3JpYmVyU3dhcHBlcigpO1xuICAgICAgICBsZXQgc3Vic2NyaXB0aW9uO1xuICAgICAgICBjb25uZWN0aW9uID0gbmV3IF9SZWFzc2VtYmx5RHVwbGV4Q29ubmVjdGlvbi5SZWFzc2VtYmx5RHVwbGV4Q29ubmVjdGlvbihcbiAgICAgICAgICBjb25uZWN0aW9uXG4gICAgICAgICk7XG4gICAgICAgIGNvbm5lY3Rpb24ucmVjZWl2ZSgpLnN1YnNjcmliZShcbiAgICAgICAgICBzd2FwcGVyLnN3YXAoe1xuICAgICAgICAgICAgb25FcnJvcjogKGVycm9yKSA9PiBjb25zb2xlLmVycm9yKGVycm9yKSxcbiAgICAgICAgICAgIG9uTmV4dDogKGZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZnJhbWUudHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5SRVNVTUU6XG4gICAgICAgICAgICAgICAgICBjb25uZWN0aW9uLnNlbmRPbmUoe1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBfUlNvY2tldEZyYW1lLkVSUk9SX0NPREVTLlJFSkVDVEVEX1JFU1VNRSxcbiAgICAgICAgICAgICAgICAgICAgZmxhZ3M6IDAsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSU29ja2V0U2VydmVyOiBSRVNVTUUgbm90IHN1cHBvcnRlZC4nLFxuICAgICAgICAgICAgICAgICAgICBzdHJlYW1JZDogX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRCxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5FUlJPUixcbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICBjb25uZWN0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuU0VUVVA6XG4gICAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2V0dXBMZWFzZUVycm9yKGZyYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25uZWN0aW9uLnNlbmRPbmUoe1xuICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IF9SU29ja2V0RnJhbWUuRVJST1JfQ09ERVMuSU5WQUxJRF9TRVRVUCxcbiAgICAgICAgICAgICAgICAgICAgICBmbGFnczogMCxcbiAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUlNvY2tldFNlcnZlcjogTEVBU0Ugbm90IHN1cHBvcnRlZC4nLFxuICAgICAgICAgICAgICAgICAgICAgIHN0cmVhbUlkOiBfUlNvY2tldEZyYW1lLkNPTk5FQ1RJT05fU1RSRUFNX0lELFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IF9SU29ja2V0RnJhbWUuRlJBTUVfVFlQRVMuRVJST1IsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjb25zdCBzZXJpYWxpemVycyA9IHRoaXMuX2dldFNlcmlhbGl6ZXJzKCk7XG5cbiAgICAgICAgICAgICAgICAgIGxldCByZXF1ZXN0ZXJMZWFzZUhhbmRsZXI7XG4gICAgICAgICAgICAgICAgICBsZXQgcmVzcG9uZGVyTGVhc2VIYW5kbGVyO1xuXG4gICAgICAgICAgICAgICAgICBjb25zdCBsZWFzZXNTdXBwbGllciA9IHRoaXMuX2NvbmZpZy5sZWFzZXM7XG4gICAgICAgICAgICAgICAgICBpZiAobGVhc2VzU3VwcGxpZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVhc2UgPSBsZWFzZXNTdXBwbGllcigpO1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZXJMZWFzZUhhbmRsZXIgPSBuZXcgX1JTb2NrZXRMZWFzZS5SZXF1ZXN0ZXJMZWFzZUhhbmRsZXIoXG4gICAgICAgICAgICAgICAgICAgICAgbGVhc2UuX3JlY2VpdmVyXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uZGVyTGVhc2VIYW5kbGVyID0gbmV3IF9SU29ja2V0TGVhc2UuUmVzcG9uZGVyTGVhc2VIYW5kbGVyKFxuICAgICAgICAgICAgICAgICAgICAgIGxlYXNlLl9zZW5kZXIsXG4gICAgICAgICAgICAgICAgICAgICAgbGVhc2UuX3N0YXRzXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBjb25zdCBzZXJ2ZXJNYWNoaW5lID0gKDAsXG4gICAgICAgICAgICAgICAgICBfUlNvY2tldE1hY2hpbmUuY3JlYXRlU2VydmVyTWFjaGluZSkoXG4gICAgICAgICAgICAgICAgICAgIGNvbm5lY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgc3dhcHBlci5zd2FwKHN1YnNjcmliZXIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmcmFtZS5saWZldGltZSxcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXplcnMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbmZpZy5lcnJvckhhbmRsZXIsXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RlckxlYXNlSGFuZGxlcixcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uZGVyTGVhc2VIYW5kbGVyXG4gICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXF1ZXN0SGFuZGxlciA9IHRoaXMuX2NvbmZpZy5nZXRSZXF1ZXN0SGFuZGxlcihcbiAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJNYWNoaW5lLFxuICAgICAgICAgICAgICAgICAgICAgIGRlc2VyaWFsaXplUGF5bG9hZChzZXJpYWxpemVycywgZnJhbWUpXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgc2VydmVyTWFjaGluZS5zZXRSZXF1ZXN0SGFuZGxlcihyZXF1ZXN0SGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zLmFkZChzZXJ2ZXJNYWNoaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvbi5jb25uZWN0aW9uU3RhdHVzKCkuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgICBvbk5leHQ6IChzdGF0dXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmtpbmQgPT09ICdDTE9TRUQnIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5raW5kID09PSAnRVJST1InXG4gICAgICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbnMuZGVsZXRlKHNlcnZlck1hY2hpbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgb25TdWJzY3JpYmU6IChzdWJzY3JpcHRpb24pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvbi5zZW5kT25lKHtcbiAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBfUlNvY2tldEZyYW1lLkVSUk9SX0NPREVTLlJFSkVDVEVEX1NFVFVQLFxuICAgICAgICAgICAgICAgICAgICAgIGZsYWdzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgICAgICAgICAnQXBwbGljYXRpb24gcmVqZWN0ZWQgc2V0dXAsIHJlYXNvbjogJyArIGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgc3RyZWFtSWQ6IF9SU29ja2V0RnJhbWUuQ09OTkVDVElPTl9TVFJFQU1fSUQsXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZTogX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5FUlJPUixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgJ1JTb2NrZXRTZXJ2ZXI6IEV4cGVjdGVkIGZpcnN0IGZyYW1lIHRvIGJlIFNFVFVQIG9yIFJFU1VNRSwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2dvdCBgJXNgLicsXG4gICAgICAgICAgICAgICAgICAgICgwLCBfUlNvY2tldEZyYW1lLmdldEZyYW1lVHlwZU5hbWUpKGZyYW1lLnR5cGUpXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25TdWJzY3JpYmU6IChfc3Vic2NyaXB0aW9uKSA9PiB7XG4gICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IF9zdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5yZXF1ZXN0KDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG4gIHN0YXJ0KCkge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKFxuICAgICAgIXRoaXMuX3N0YXJ0ZWQsXG4gICAgICAnUlNvY2tldFNlcnZlcjogVW5leHBlY3RlZCBjYWxsIHRvIHN0YXJ0KCksIGFscmVhZHkgc3RhcnRlZC4nXG4gICAgKTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9jb25maWcudHJhbnNwb3J0LnN0YXJ0KCkuc3Vic2NyaWJlKHtcbiAgICAgIG9uQ29tcGxldGU6IHRoaXMuX2hhbmRsZVRyYW5zcG9ydENvbXBsZXRlLFxuICAgICAgb25FcnJvcjogdGhpcy5faGFuZGxlVHJhbnNwb3J0RXJyb3IsXG4gICAgICBvbk5leHQ6IHRoaXMuX2hhbmRsZVRyYW5zcG9ydENvbm5lY3Rpb24sXG4gICAgICBvblN1YnNjcmliZTogKHN1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb247XG4gICAgICAgIHN1YnNjcmlwdGlvbi5yZXF1ZXN0KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbiAgc3RvcCgpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgfVxuICAgIHRoaXMuX2NvbmZpZy50cmFuc3BvcnQuc3RvcCgpO1xuICAgIHRoaXMuX2hhbmRsZVRyYW5zcG9ydEVycm9yKFxuICAgICAgbmV3IEVycm9yKCdSU29ja2V0U2VydmVyOiBDb25uZWN0aW9uIHRlcm1pbmF0ZWQgdmlhIHN0b3AoKS4nKVxuICAgICk7XG4gIH1cblxuICBfZ2V0U2VyaWFsaXplcnMoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuX2NvbmZpZy5zZXJpYWxpemVycyB8fCBfUlNvY2tldFNlcmlhbGl6YXRpb24uSWRlbnRpdHlTZXJpYWxpemVyc1xuICAgICk7XG4gIH1cblxuICBfc2V0dXBMZWFzZUVycm9yKGZyYW1lKSB7XG4gICAgY29uc3QgY2xpZW50TGVhc2VFbmFibGVkID1cbiAgICAgIChmcmFtZS5mbGFncyAmIF9SU29ja2V0RnJhbWUuRkxBR1MuTEVBU0UpID09PSBfUlNvY2tldEZyYW1lLkZMQUdTLkxFQVNFO1xuICAgIGNvbnN0IHNlcnZlckxlYXNlRW5hYmxlZCA9IHRoaXMuX2NvbmZpZy5sZWFzZXM7XG4gICAgcmV0dXJuIGNsaWVudExlYXNlRW5hYmxlZCAmJiAhc2VydmVyTGVhc2VFbmFibGVkO1xuICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBSU29ja2V0U2VydmVyO1xuXG5jbGFzcyBTdWJzY3JpYmVyU3dhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHRhcmdldCkge1xuICAgIHRoaXMuX3RhcmdldCA9IHRhcmdldDtcbiAgfVxuXG4gIHN3YXAobmV4dCkge1xuICAgIHRoaXMuX3RhcmdldCA9IG5leHQ7XG4gICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fdGFyZ2V0Lm9uU3Vic2NyaWJlICYmIHRoaXMuX3RhcmdldC5vblN1YnNjcmliZSh0aGlzLl9zdWJzY3JpcHRpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG9uQ29tcGxldGUoKSB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkodGhpcy5fdGFyZ2V0LCAnbXVzdCBoYXZlIHRhcmdldCcpO1xuICAgIHRoaXMuX3RhcmdldC5vbkNvbXBsZXRlICYmIHRoaXMuX3RhcmdldC5vbkNvbXBsZXRlKCk7XG4gIH1cbiAgb25FcnJvcihlcnJvcikge1xuICAgICgwLCBfSW52YXJpYW50LmRlZmF1bHQpKHRoaXMuX3RhcmdldCwgJ211c3QgaGF2ZSB0YXJnZXQnKTtcbiAgICB0aGlzLl90YXJnZXQub25FcnJvciAmJiB0aGlzLl90YXJnZXQub25FcnJvcihlcnJvcik7XG4gIH1cbiAgb25OZXh0KHZhbHVlKSB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkodGhpcy5fdGFyZ2V0LCAnbXVzdCBoYXZlIHRhcmdldCcpO1xuICAgIHRoaXMuX3RhcmdldC5vbk5leHQgJiYgdGhpcy5fdGFyZ2V0Lm9uTmV4dCh2YWx1ZSk7XG4gIH1cbiAgb25TdWJzY3JpYmUoc3Vic2NyaXB0aW9uKSB7XG4gICAgKDAsIF9JbnZhcmlhbnQuZGVmYXVsdCkodGhpcy5fdGFyZ2V0LCAnbXVzdCBoYXZlIHRhcmdldCcpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbjtcbiAgICB0aGlzLl90YXJnZXQub25TdWJzY3JpYmUgJiYgdGhpcy5fdGFyZ2V0Lm9uU3Vic2NyaWJlKHN1YnNjcmlwdGlvbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVzZXJpYWxpemVQYXlsb2FkKHNlcmlhbGl6ZXJzLCBmcmFtZSkge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IHNlcmlhbGl6ZXJzLmRhdGEuZGVzZXJpYWxpemUoZnJhbWUuZGF0YSksXG4gICAgbWV0YWRhdGE6IHNlcmlhbGl6ZXJzLm1ldGFkYXRhLmRlc2VyaWFsaXplKGZyYW1lLm1ldGFkYXRhKSxcbiAgfTtcbn1cbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuTUlOT1JfVkVSU0lPTiA9IGV4cG9ydHMuTUFKT1JfVkVSU0lPTiA9IHZvaWQgMDtcblxuY29uc3QgTUFKT1JfVkVSU0lPTiA9IDE7XG5leHBvcnRzLk1BSk9SX1ZFUlNJT04gPSBNQUpPUl9WRVJTSU9OO1xuY29uc3QgTUlOT1JfVkVSU0lPTiA9IDA7XG5leHBvcnRzLk1JTk9SX1ZFUlNJT04gPSBNSU5PUl9WRVJTSU9OO1xuIiwiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5leHBvcnRzLlJlYXNzZW1ibHlEdXBsZXhDb25uZWN0aW9uID0gdm9pZCAwO1xuXG52YXIgX0xpdGVCdWZmZXIgPSByZXF1aXJlKCcuL0xpdGVCdWZmZXInKTtcbnZhciBfcnNvY2tldEZsb3dhYmxlID0gcmVxdWlyZSgncnNvY2tldC1mbG93YWJsZScpO1xudmFyIF9SU29ja2V0RnJhbWUgPSByZXF1aXJlKCcuL1JTb2NrZXRGcmFtZScpO1xuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuY2xhc3MgUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihzb3VyY2UpIHtcbiAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICBzZW5kT25lKGZyYW1lKSB7XG4gICAgdGhpcy5fc291cmNlLnNlbmRPbmUoZnJhbWUpO1xuICB9XG5cbiAgc2VuZChpbnB1dCkge1xuICAgIHRoaXMuX3NvdXJjZS5zZW5kKGlucHV0KTtcbiAgfVxuXG4gIHJlY2VpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NvdXJjZVxuICAgICAgLnJlY2VpdmUoKVxuICAgICAgLmxpZnQoKGFjdHVhbCkgPT4gbmV3IFJlYXNzZW1ibHlTdWJzY3JpYmVyKGFjdHVhbCkpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5fc291cmNlLmNsb3NlKCk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIHRoaXMuX3NvdXJjZS5jb25uZWN0KCk7XG4gIH1cblxuICBjb25uZWN0aW9uU3RhdHVzKCkge1xuICAgIHJldHVybiB0aGlzLl9zb3VyY2UuY29ubmVjdGlvblN0YXR1cygpO1xuICB9XG59XG5leHBvcnRzLlJlYXNzZW1ibHlEdXBsZXhDb25uZWN0aW9uID0gUmVhc3NlbWJseUR1cGxleENvbm5lY3Rpb247XG5cbmNsYXNzIFJlYXNzZW1ibHlTdWJzY3JpYmVyIHtcbiAgY29uc3RydWN0b3IoYWN0dWFsKSB7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsICdfZnJhbWVzUmVhc3NlbWJseU1hcCcsIG5ldyBNYXAoKSk7XG4gICAgdGhpcy5fYWN0dWFsID0gYWN0dWFsO1xuICB9XG5cbiAgcmVxdWVzdChuKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLnJlcXVlc3Qobik7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgIHRoaXMuX2ZyYW1lc1JlYXNzZW1ibHlNYXAuY2xlYXIoKTtcbiAgfVxuXG4gIG9uU3Vic2NyaWJlKHMpIHtcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uID09IG51bGwpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHM7XG4gICAgICB0aGlzLl9hY3R1YWwub25TdWJzY3JpYmUodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHMuY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgb25Db21wbGV0ZSgpIHtcbiAgICB0aGlzLl9hY3R1YWwub25Db21wbGV0ZSgpO1xuICB9XG5cbiAgb25FcnJvcihlcnJvcikge1xuICAgIHRoaXMuX2FjdHVhbC5vbkVycm9yKGVycm9yKTtcbiAgfVxuXG4gIG9uTmV4dChmcmFtZSkge1xuICAgIGNvbnN0IHN0cmVhbUlkID0gZnJhbWUuc3RyZWFtSWQ7XG4gICAgaWYgKHN0cmVhbUlkICE9PSBfUlNvY2tldEZyYW1lLkNPTk5FQ1RJT05fU1RSRUFNX0lEKSB7XG4gICAgICBjb25zdCBoYXNGb2xsb3dzRmxhZyA9ICgwLCBfUlNvY2tldEZyYW1lLmlzRm9sbG93cykoZnJhbWUuZmxhZ3MpO1xuICAgICAgY29uc3QgaGFzQ29tcGxldGVGbGFnID0gKDAsIF9SU29ja2V0RnJhbWUuaXNDb21wbGV0ZSkoZnJhbWUuZmxhZ3MpO1xuICAgICAgY29uc3QgaXNDYW5jZWxPckVycm9yID1cbiAgICAgICAgZnJhbWUudHlwZSA9PT0gX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFUy5FUlJPUiB8fFxuICAgICAgICBmcmFtZS50eXBlID09PSBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTLkNBTkNFTDtcblxuICAgICAgY29uc3Qgc3RvcmVkRnJhbWUgPSB0aGlzLl9mcmFtZXNSZWFzc2VtYmx5TWFwLmdldChzdHJlYW1JZCk7XG4gICAgICBpZiAoc3RvcmVkRnJhbWUpIHtcbiAgICAgICAgaWYgKGlzQ2FuY2VsT3JFcnJvcikge1xuICAgICAgICAgIHRoaXMuX2ZyYW1lc1JlYXNzZW1ibHlNYXAuZGVsZXRlKHN0cmVhbUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3RvcmVkRnJhbWUubWV0YWRhdGEgJiYgZnJhbWUubWV0YWRhdGEpIHtcbiAgICAgICAgICAgIHN0b3JlZEZyYW1lLm1ldGFkYXRhID0gY29uY2F0Q29udGVudChcbiAgICAgICAgICAgICAgc3RvcmVkRnJhbWUubWV0YWRhdGEsXG4gICAgICAgICAgICAgIGZyYW1lLm1ldGFkYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdG9yZWRGcmFtZS5kYXRhICYmIGZyYW1lLmRhdGEpIHtcbiAgICAgICAgICAgIHN0b3JlZEZyYW1lLmRhdGEgPSBjb25jYXRDb250ZW50KHN0b3JlZEZyYW1lLmRhdGEsIGZyYW1lLmRhdGEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXN0b3JlZEZyYW1lLmRhdGEgJiYgZnJhbWUuZGF0YSkge1xuICAgICAgICAgICAgc3RvcmVkRnJhbWUuZGF0YSA9IGZyYW1lLmRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFoYXNGb2xsb3dzRmxhZyB8fCBoYXNDb21wbGV0ZUZsYWcpIHtcbiAgICAgICAgICAgIGlmIChoYXNDb21wbGV0ZUZsYWcpIHtcbiAgICAgICAgICAgICAgc3RvcmVkRnJhbWUuZmxhZ3MgfD0gX1JTb2NrZXRGcmFtZS5GTEFHUy5DT01QTEVURTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZnJhbWVzUmVhc3NlbWJseU1hcC5kZWxldGUoc3RyZWFtSWQpO1xuICAgICAgICAgICAgdGhpcy5fYWN0dWFsLm9uTmV4dChzdG9yZWRGcmFtZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGhhc0ZvbGxvd3NGbGFnICYmICFoYXNDb21wbGV0ZUZsYWcgJiYgIWlzQ2FuY2VsT3JFcnJvcikge1xuICAgICAgICB0aGlzLl9mcmFtZXNSZWFzc2VtYmx5TWFwLnNldChzdHJlYW1JZCwgZnJhbWUpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9hY3R1YWwub25OZXh0KGZyYW1lKTtcbiAgfVxufVxuXG5jb25zdCBjb25jYXRDb250ZW50ID0gKGEsIGIpID0+IHtcbiAgc3dpdGNoIChhLmNvbnN0cnVjdG9yLm5hbWUpIHtcbiAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgcmV0dXJuIGEgKyBiO1xuICAgIGNhc2UgJ1VpbnQ4QXJyYXknOlxuICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoYS5sZW5ndGggKyBiLmxlbmd0aCk7XG4gICAgICByZXN1bHQuc2V0KGEpO1xuICAgICAgcmVzdWx0LnNldChiLCBhLmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5jb25jYXQoW2EsIGJdKTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5lbmNvZGVSb3V0ZXMgPSBlbmNvZGVSb3V0ZXM7XG5leHBvcnRzLmVuY29kZVJvdXRlID0gZW5jb2RlUm91dGU7XG5leHBvcnRzLmRlY29kZVJvdXRlcyA9IGRlY29kZVJvdXRlcztcbmV4cG9ydHMuUm91dGluZ01ldGFkYXRhID0gdm9pZCAwO1xuXG52YXIgX0xpdGVCdWZmZXIgPSByZXF1aXJlKCcuL0xpdGVCdWZmZXInKTtcbnZhciBfUlNvY2tldEJ1ZmZlclV0aWxzID0gcmVxdWlyZSgnLi9SU29ja2V0QnVmZmVyVXRpbHMnKTsgLy8gJEZsb3dGaXhNZVxuXG4vLyAkRmxvd0ZpeE1lXG5jbGFzcyBSb3V0aW5nTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihidWZmZXIpIHtcbiAgICB0aGlzLl9idWZmZXIgPSBidWZmZXI7XG4gIH1cblxuICBpdGVyYXRvcigpIHtcbiAgICByZXR1cm4gZGVjb2RlUm91dGVzKHRoaXMuX2J1ZmZlcik7XG4gIH1cblxuICAvLyAkRmxvd0ZpeE1lXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkge1xuICAgIHJldHVybiBkZWNvZGVSb3V0ZXModGhpcy5fYnVmZmVyKTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY29kZSBnaXZlbiBzZXQgb2Ygcm91dGVzIGludG8ge0BsaW5rIEJ1ZmZlcn0gZm9sbG93aW5nIHRoZSA8YSBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL3Jzb2NrZXQvcnNvY2tldC9ibG9iL21hc3Rlci9FeHRlbnNpb25zL1JvdXRpbmcubWRcIj5Sb3V0aW5nIE1ldGFkYXRhIExheW91dDwvYT5cbiAqXG4gKiBAcGFyYW0gcm91dGVzIG5vbi1lbXB0eSBzZXQgb2Ygcm91dGVzXG4gKiBAcmV0dXJucyB7QnVmZmVyfSB3aXRoIGVuY29kZWQgY29udGVudFxuICovIGV4cG9ydHMuUm91dGluZ01ldGFkYXRhID0gUm91dGluZ01ldGFkYXRhO1xuZnVuY3Rpb24gZW5jb2RlUm91dGVzKC4uLnJvdXRlcykge1xuICBpZiAocm91dGVzLmxlbmd0aCA8IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JvdXRlcyBzaG91bGQgYmUgbm9uIGVtcHR5IGFycmF5Jyk7XG4gIH1cblxuICByZXR1cm4gX0xpdGVCdWZmZXIuTGl0ZUJ1ZmZlci5jb25jYXQoXG4gICAgcm91dGVzLm1hcCgocm91dGUpID0+IGVuY29kZVJvdXRlKHJvdXRlKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gZW5jb2RlUm91dGUocm91dGUpIHtcbiAgY29uc3QgZW5jb2RlZFJvdXRlID0gKDAsIF9SU29ja2V0QnVmZmVyVXRpbHMudG9CdWZmZXIpKHJvdXRlLCAndXRmOCcpO1xuXG4gIGlmIChlbmNvZGVkUm91dGUubGVuZ3RoID4gMjU1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYHJvdXRlIGxlbmd0aCBzaG91bGQgZml0IGludG8gdW5zaWduZWQgYnl0ZSBsZW5ndGggYnV0IHRoZSBnaXZlbiBvbmUgaXMgJHtlbmNvZGVkUm91dGUubGVuZ3RofWBcbiAgICApO1xuICB9XG5cbiAgY29uc3QgZW5jb2RlZExlbmd0aCA9ICgwLCBfUlNvY2tldEJ1ZmZlclV0aWxzLmNyZWF0ZUJ1ZmZlcikoMSk7XG5cbiAgZW5jb2RlZExlbmd0aC53cml0ZVVJbnQ4KGVuY29kZWRSb3V0ZS5sZW5ndGgpO1xuXG4gIHJldHVybiBfTGl0ZUJ1ZmZlci5MaXRlQnVmZmVyLmNvbmNhdChbZW5jb2RlZExlbmd0aCwgZW5jb2RlZFJvdXRlXSk7XG59XG5cbmZ1bmN0aW9uKiBkZWNvZGVSb3V0ZXMocm91dGVNZXRhZGF0YUJ1ZmZlcikge1xuICBjb25zdCBsZW5ndGggPSByb3V0ZU1ldGFkYXRhQnVmZmVyLmJ5dGVMZW5ndGg7XG4gIGxldCBvZmZzZXQgPSAwO1xuXG4gIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICBjb25zdCByb3V0ZUxlbmd0aCA9IHJvdXRlTWV0YWRhdGFCdWZmZXIucmVhZFVJbnQ4KG9mZnNldCsrKTtcblxuICAgIGlmIChvZmZzZXQgKyByb3V0ZUxlbmd0aCA+IGxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWFsZm9ybWVkIFJvdXRlTWV0YWRhdGEuIE9mZnNldCgke29mZnNldH0pICsgUm91dGVMZW5ndGgoJHtyb3V0ZUxlbmd0aH0pIGlzIGdyZWF0ZXIgdGhhbiBUb3RhbExlbmd0aGBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgcm91dGUgPSByb3V0ZU1ldGFkYXRhQnVmZmVyLnRvU3RyaW5nKFxuICAgICAgJ3V0ZjgnLFxuICAgICAgb2Zmc2V0LFxuICAgICAgb2Zmc2V0ICsgcm91dGVMZW5ndGhcbiAgICApO1xuXG4gICAgb2Zmc2V0ICs9IHJvdXRlTGVuZ3RoO1xuICAgIHlpZWxkIHJvdXRlO1xuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuVFlQRVNfQllfQVVUSF9TVFJJTkcgPSBleHBvcnRzLlRZUEVTX0JZX0FVVEhfSUQgPSBleHBvcnRzLkJFQVJFUiA9IGV4cG9ydHMuU0lNUExFID0gZXhwb3J0cy5VTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRSA9IGV4cG9ydHMuVU5QQVJTRUFCTEVfQVVUSF9UWVBFID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG5jbGFzcyBXZWxsS25vd25BdXRoVHlwZSB7XG4gIGNvbnN0cnVjdG9yKHN0ciwgaWRlbnRpZmllcikge1xuICAgIHRoaXMuX3N0cmluZyA9IHN0cjtcbiAgICB0aGlzLl9pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSB7QGxpbmsgV2VsbEtub3duQXV0aFR5cGV9IGZvciB0aGUgZ2l2ZW4gaWRlbnRpZmllciAoYXMgYW4ge0BsaW5rIG51bWJlcn0pLiBWYWxpZFxuICAgKiBpZGVudGlmaWVycyBhcmUgZGVmaW5lZCB0byBiZSBpbnRlZ2VycyBiZXR3ZWVuIDAgYW5kIDEyNywgaW5jbHVzaXZlLiBJZGVudGlmaWVycyBvdXRzaWRlIG9mXG4gICAqIHRoaXMgcmFuZ2Ugd2lsbCBwcm9kdWNlIHRoZSB7QGxpbmsgI1VOUEFSU0VBQkxFX0FVVEhfVFlQRX0uIEFkZGl0aW9uYWxseSwgc29tZSBpZGVudGlmaWVycyBpblxuICAgKiB0aGF0IHJhbmdlIGFyZSBzdGlsbCBvbmx5IHJlc2VydmVkIGFuZCBkb24ndCBoYXZlIGEgdHlwZSBhc3NvY2lhdGVkIHlldDogdGhpcyBtZXRob2QgcmV0dXJuc1xuICAgKiB0aGUge0BsaW5rICNVTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRX0gd2hlbiBwYXNzaW5nIHN1Y2ggYW4gaWRlbnRpZmllciwgd2hpY2ggbGV0cyBjYWxsIHNpdGVzXG4gICAqIHBvdGVudGlhbGx5IGRldGVjdCB0aGlzIGFuZCBrZWVwIHRoZSBvcmlnaW5hbCByZXByZXNlbnRhdGlvbiB3aGVuIHRyYW5zbWl0dGluZyB0aGUgYXNzb2NpYXRlZFxuICAgKiBtZXRhZGF0YSBidWZmZXIuXG4gICAqXG4gICAqIEBwYXJhbSBpZCB0aGUgbG9va2VkIHVwIGlkZW50aWZpZXJcbiAgICogQHJldHVybiB0aGUge0BsaW5rIFdlbGxLbm93bkF1dGhUeXBlfSwgb3Ige0BsaW5rICNVTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRX0gaWYgdGhlIGlkIGlzIG91dFxuICAgKiAgICAgb2YgdGhlIHNwZWNpZmljYXRpb24ncyByYW5nZSwgb3Ige0BsaW5rICNVTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRX0gaWYgdGhlIGlkIGlzIG9uZSB0aGF0XG4gICAqICAgICBpcyBtZXJlbHkgcmVzZXJ2ZWQgYnV0IHVua25vd24gdG8gdGhpcyBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIHN0YXRpYyBmcm9tSWRlbnRpZmllcihpZCkge1xuICAgIGlmIChpZCA8IDB4MDAgfHwgaWQgPiAweDdmKSB7XG4gICAgICByZXR1cm4gVU5QQVJTRUFCTEVfQVVUSF9UWVBFO1xuICAgIH1cbiAgICByZXR1cm4gVFlQRVNfQllfQVVUSF9JRFtpZF07XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUge0BsaW5rIFdlbGxLbm93bkF1dGhUeXBlfSBmb3IgdGhlIGdpdmVuIHtAbGluayBTdHJpbmd9IHJlcHJlc2VudGF0aW9uLiBJZiB0aGVcbiAgICogcmVwcmVzZW50YXRpb24gaXMge0Bjb2RlIG51bGx9IG9yIGRvZXNuJ3QgbWF0Y2ggYSB7QGxpbmsgV2VsbEtub3duQXV0aFR5cGV9LCB0aGUge0BsaW5rXG4gICAqICNVTlBBUlNFQUJMRV9BVVRIX1RZUEV9IGlzIHJldHVybmVkLlxuICAgKlxuICAgKiBAcGFyYW0gYXV0aFR5cGVTdHJpbmcgdGhlIGxvb2tlZCB1cCBtaW1lIHR5cGVcbiAgICogQHJldHVybiB0aGUgbWF0Y2hpbmcge0BsaW5rIFdlbGxLbm93bkF1dGhUeXBlfSwgb3Ige0BsaW5rICNVTlBBUlNFQUJMRV9BVVRIX1RZUEV9IGlmIG5vbmVcbiAgICogICAgIG1hdGNoZXNcbiAgICovXG4gIHN0YXRpYyBmcm9tU3RyaW5nKGF1dGhUeXBlU3RyaW5nKSB7XG4gICAgaWYgKCFhdXRoVHlwZVN0cmluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0eXBlIG11c3QgYmUgbm9uLW51bGwnKTtcbiAgICB9XG5cbiAgICAvLyBmb3JjZSBVTlBBUlNFQUJMRSBpZiBieSBjaGFuY2UgVU5LTk9XTl9SRVNFUlZFRF9NSU1FX1RZUEUncyB0ZXh0IGhhcyBiZWVuIHVzZWRcbiAgICBpZiAoYXV0aFR5cGVTdHJpbmcgPT09IFVOS05PV05fUkVTRVJWRURfQVVUSF9UWVBFLnN0cmluZykge1xuICAgICAgcmV0dXJuIFVOUEFSU0VBQkxFX0FVVEhfVFlQRTtcbiAgICB9XG5cbiAgICByZXR1cm4gVFlQRVNfQllfQVVUSF9TVFJJTkcuZ2V0KGF1dGhUeXBlU3RyaW5nKSB8fCBVTlBBUlNFQUJMRV9BVVRIX1RZUEU7XG4gIH1cblxuICAvKiogQHJldHVybiB0aGUgYnl0ZSBpZGVudGlmaWVyIG9mIHRoZSBtaW1lIHR5cGUsIGd1YXJhbnRlZWQgdG8gYmUgcG9zaXRpdmUgb3IgemVyby4gKi9cbiAgZ2V0IGlkZW50aWZpZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkZW50aWZpZXI7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiB0aGUgbWltZSB0eXBlIHJlcHJlc2VudGVkIGFzIGEge0BsaW5rIFN0cmluZ30sIHdoaWNoIGlzIG1hZGUgb2YgVVNfQVNDSUkgY29tcGF0aWJsZVxuICAgKiAgICAgY2hhcmFjdGVycyBvbmx5XG4gICAqL1xuICBnZXQgc3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmc7XG4gIH1cblxuICAvKiogQHNlZSAjc3RyaW5nKCkgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZztcbiAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gV2VsbEtub3duQXV0aFR5cGU7XG5cbmNvbnN0IFVOUEFSU0VBQkxFX0FVVEhfVFlQRSA9IG5ldyBXZWxsS25vd25BdXRoVHlwZShcbiAgJ1VOUEFSU0VBQkxFX0FVVEhfVFlQRV9ET19OT1RfVVNFJyxcbiAgLTJcbik7XG5leHBvcnRzLlVOUEFSU0VBQkxFX0FVVEhfVFlQRSA9IFVOUEFSU0VBQkxFX0FVVEhfVFlQRTtcblxuY29uc3QgVU5LTk9XTl9SRVNFUlZFRF9BVVRIX1RZUEUgPSBuZXcgV2VsbEtub3duQXV0aFR5cGUoXG4gICdVTktOT1dOX1lFVF9SRVNFUlZFRF9ET19OT1RfVVNFJyxcbiAgLTFcbik7XG5leHBvcnRzLlVOS05PV05fUkVTRVJWRURfQVVUSF9UWVBFID0gVU5LTk9XTl9SRVNFUlZFRF9BVVRIX1RZUEU7XG5cbmNvbnN0IFNJTVBMRSA9IG5ldyBXZWxsS25vd25BdXRoVHlwZSgnc2ltcGxlJywgMHgwMCk7XG5leHBvcnRzLlNJTVBMRSA9IFNJTVBMRTtcbmNvbnN0IEJFQVJFUiA9IG5ldyBXZWxsS25vd25BdXRoVHlwZSgnYmVhcmVyJywgMHgwMSk7XG5leHBvcnRzLkJFQVJFUiA9IEJFQVJFUjtcblxuY29uc3QgVFlQRVNfQllfQVVUSF9JRCA9IG5ldyBBcnJheSgxMjgpO1xuZXhwb3J0cy5UWVBFU19CWV9BVVRIX0lEID0gVFlQRVNfQllfQVVUSF9JRDtcbmNvbnN0IFRZUEVTX0JZX0FVVEhfU1RSSU5HID0gbmV3IE1hcCgpO1xuZXhwb3J0cy5UWVBFU19CWV9BVVRIX1NUUklORyA9IFRZUEVTX0JZX0FVVEhfU1RSSU5HO1xuXG5jb25zdCBBTExfTUlNRV9UWVBFUyA9IFtcbiAgVU5QQVJTRUFCTEVfQVVUSF9UWVBFLFxuICBVTktOT1dOX1JFU0VSVkVEX0FVVEhfVFlQRSxcbiAgU0lNUExFLFxuICBCRUFSRVIsXG5dO1xuXG5UWVBFU19CWV9BVVRIX0lELmZpbGwoVU5LTk9XTl9SRVNFUlZFRF9BVVRIX1RZUEUpO1xuXG5mb3IgKGNvbnN0IHZhbHVlIG9mIEFMTF9NSU1FX1RZUEVTKSB7XG4gIGlmICh2YWx1ZS5pZGVudGlmaWVyID49IDApIHtcbiAgICBUWVBFU19CWV9BVVRIX0lEW3ZhbHVlLmlkZW50aWZpZXJdID0gdmFsdWU7XG4gICAgVFlQRVNfQllfQVVUSF9TVFJJTkcuc2V0KHZhbHVlLnN0cmluZywgdmFsdWUpO1xuICB9XG59XG5cbmlmIChPYmplY3Quc2VhbCkge1xuICBPYmplY3Quc2VhbChUWVBFU19CWV9BVVRIX0lEKTtcbn1cbiIsIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5UWVBFU19CWV9NSU1FX1NUUklORyA9IGV4cG9ydHMuVFlQRVNfQllfTUlNRV9JRCA9IGV4cG9ydHMuTUVTU0FHRV9SU09DS0VUX0NPTVBPU0lURV9NRVRBREFUQSA9IGV4cG9ydHMuTUVTU0FHRV9SU09DS0VUX1JPVVRJTkcgPSBleHBvcnRzLk1FU1NBR0VfUlNPQ0tFVF9UUkFDSU5HX1pJUEtJTiA9IGV4cG9ydHMuTUVTU0FHRV9SU09DS0VUX0FVVEhFTlRJQ0FUSU9OID0gZXhwb3J0cy5NRVNTQUdFX1JTT0NLRVRfQUNDRVBUX01JTUVUWVBFUyA9IGV4cG9ydHMuTUVTU0FHRV9SU09DS0VUX01JTUVUWVBFID0gZXhwb3J0cy5BUFBMSUNBVElPTl9DTE9VREVWRU5UU19KU09OID0gZXhwb3J0cy5BUFBMSUNBVElPTl9KQVZBX09CSkVDVCA9IGV4cG9ydHMuQVBQTElDQVRJT05fSEVTU0lBTiA9IGV4cG9ydHMuVklERU9fVlA4ID0gZXhwb3J0cy5WSURFT19IMjY1ID0gZXhwb3J0cy5WSURFT19IMjY0ID0gZXhwb3J0cy5URVhUX1hNTCA9IGV4cG9ydHMuVEVYVF9QTEFJTiA9IGV4cG9ydHMuVEVYVF9IVE1MID0gZXhwb3J0cy5URVhUX0NTViA9IGV4cG9ydHMuVEVYVF9DU1MgPSBleHBvcnRzLk1VTFRJUEFSVF9NSVhFRCA9IGV4cG9ydHMuSU1BR0VfVElGRiA9IGV4cG9ydHMuSU1BR0VfUE5HID0gZXhwb3J0cy5JTUFHRV9KUEVHID0gZXhwb3J0cy5JTUFHRV9IRUlGID0gZXhwb3J0cy5JTUFHRV9IRUlGX1NFUVVFTkNFID0gZXhwb3J0cy5JTUFHRV9IRUlDID0gZXhwb3J0cy5JTUFHRV9IRUlDX1NFUVVFTkNFID0gZXhwb3J0cy5JTUFHRV9HSUcgPSBleHBvcnRzLklNQUdFX0JNUCA9IGV4cG9ydHMuQVVESU9fVk9SQklTID0gZXhwb3J0cy5BVURJT19PUFVTID0gZXhwb3J0cy5BVURJT19PR0cgPSBleHBvcnRzLkFVRElPX01QRUcgPSBleHBvcnRzLkFVRElPX01QRUczID0gZXhwb3J0cy5BVURJT19NUDQgPSBleHBvcnRzLkFVRElPX01QMyA9IGV4cG9ydHMuQVVESU9fQUFDID0gZXhwb3J0cy5BUFBMSUNBVElPTl9aSVAgPSBleHBvcnRzLkFQUExJQ0FUSU9OX1hNTCA9IGV4cG9ydHMuQVBQTElDQVRJT05fUFJPVE9CVUYgPSBleHBvcnRzLkFQUExJQ0FUSU9OX1RIUklGVCA9IGV4cG9ydHMuQVBQTElDQVRJT05fUERGID0gZXhwb3J0cy5BUFBMSUNBVElPTl9PQ1RFVF9TVFJFQU0gPSBleHBvcnRzLkFQUExJQ0FUSU9OX0pTT04gPSBleHBvcnRzLkFQUExJQ0FUSU9OX0pBVkFTQ1JJUFQgPSBleHBvcnRzLkFQUExJQ0FUSU9OX0daSVAgPSBleHBvcnRzLkFQUExJQ0FUSU9OX0dSQVBIUUwgPSBleHBvcnRzLkFQUExJQ0FUSU9OX0NCT1IgPSBleHBvcnRzLkFQUExJQ0FUSU9OX0FWUk8gPSBleHBvcnRzLlVOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFID0gZXhwb3J0cy5VTlBBUlNFQUJMRV9NSU1FX1RZUEUgPSBleHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbmNsYXNzIFdlbGxLbm93bk1pbWVUeXBlIHtcbiAgY29uc3RydWN0b3Ioc3RyLCBpZGVudGlmaWVyKSB7XG4gICAgdGhpcy5fc3RyaW5nID0gc3RyO1xuICAgIHRoaXMuX2lkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0gZm9yIHRoZSBnaXZlbiBpZGVudGlmaWVyIChhcyBhbiB7QGNvZGUgaW50fSkuIFZhbGlkXG4gICAqIGlkZW50aWZpZXJzIGFyZSBkZWZpbmVkIHRvIGJlIGludGVnZXJzIGJldHdlZW4gMCBhbmQgMTI3LCBpbmNsdXNpdmUuIElkZW50aWZpZXJzIG91dHNpZGUgb2ZcbiAgICogdGhpcyByYW5nZSB3aWxsIHByb2R1Y2UgdGhlIHtAbGluayAjVU5QQVJTRUFCTEVfTUlNRV9UWVBFfS4gQWRkaXRpb25hbGx5LCBzb21lIGlkZW50aWZpZXJzIGluXG4gICAqIHRoYXQgcmFuZ2UgYXJlIHN0aWxsIG9ubHkgcmVzZXJ2ZWQgYW5kIGRvbid0IGhhdmUgYSB0eXBlIGFzc29jaWF0ZWQgeWV0OiB0aGlzIG1ldGhvZCByZXR1cm5zXG4gICAqIHRoZSB7QGxpbmsgI1VOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFfSB3aGVuIHBhc3Npbmcgc3VjaCBhbiBpZGVudGlmaWVyLCB3aGljaCBsZXRzIGNhbGwgc2l0ZXNcbiAgICogcG90ZW50aWFsbHkgZGV0ZWN0IHRoaXMgYW5kIGtlZXAgdGhlIG9yaWdpbmFsIHJlcHJlc2VudGF0aW9uIHdoZW4gdHJhbnNtaXR0aW5nIHRoZSBhc3NvY2lhdGVkXG4gICAqIG1ldGFkYXRhIGJ1ZmZlci5cbiAgICpcbiAgICogQHBhcmFtIGlkIHRoZSBsb29rZWQgdXAgaWRlbnRpZmllclxuICAgKiBAcmV0dXJuIHRoZSB7QGxpbmsgV2VsbEtub3duTWltZVR5cGV9LCBvciB7QGxpbmsgI1VOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFfSBpZiB0aGUgaWQgaXMgb3V0XG4gICAqICAgICBvZiB0aGUgc3BlY2lmaWNhdGlvbidzIHJhbmdlLCBvciB7QGxpbmsgI1VOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFfSBpZiB0aGUgaWQgaXMgb25lIHRoYXRcbiAgICogICAgIGlzIG1lcmVseSByZXNlcnZlZCBidXQgdW5rbm93biB0byB0aGlzIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgc3RhdGljIGZyb21JZGVudGlmaWVyKGlkKSB7XG4gICAgaWYgKGlkIDwgMHgwMCB8fCBpZCA+IDB4N2YpIHtcbiAgICAgIHJldHVybiBVTlBBUlNFQUJMRV9NSU1FX1RZUEU7XG4gICAgfVxuICAgIHJldHVybiBUWVBFU19CWV9NSU1FX0lEW2lkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSB7QGxpbmsgV2VsbEtub3duTWltZVR5cGV9IGZvciB0aGUgZ2l2ZW4ge0BsaW5rIFN0cmluZ30gcmVwcmVzZW50YXRpb24uIElmIHRoZVxuICAgKiByZXByZXNlbnRhdGlvbiBpcyB7QGNvZGUgbnVsbH0gb3IgZG9lc24ndCBtYXRjaCBhIHtAbGluayBXZWxsS25vd25NaW1lVHlwZX0sIHRoZSB7QGxpbmtcbiAgICogI1VOUEFSU0VBQkxFX01JTUVfVFlQRX0gaXMgcmV0dXJuZWQuXG4gICAqXG4gICAqIEBwYXJhbSBtaW1lVHlwZSB0aGUgbG9va2VkIHVwIG1pbWUgdHlwZVxuICAgKiBAcmV0dXJuIHRoZSBtYXRjaGluZyB7QGxpbmsgV2VsbEtub3duTWltZVR5cGV9LCBvciB7QGxpbmsgI1VOUEFSU0VBQkxFX01JTUVfVFlQRX0gaWYgbm9uZVxuICAgKiAgICAgbWF0Y2hlc1xuICAgKi9cbiAgc3RhdGljIGZyb21TdHJpbmcobWltZVR5cGUpIHtcbiAgICBpZiAoIW1pbWVUeXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3R5cGUgbXVzdCBiZSBub24tbnVsbCcpO1xuICAgIH1cblxuICAgIC8vIGZvcmNlIFVOUEFSU0VBQkxFIGlmIGJ5IGNoYW5jZSBVTktOT1dOX1JFU0VSVkVEX01JTUVfVFlQRSdzIHRleHQgaGFzIGJlZW4gdXNlZFxuICAgIGlmIChtaW1lVHlwZSA9PT0gVU5LTk9XTl9SRVNFUlZFRF9NSU1FX1RZUEUuc3RyaW5nKSB7XG4gICAgICByZXR1cm4gVU5QQVJTRUFCTEVfTUlNRV9UWVBFO1xuICAgIH1cblxuICAgIHJldHVybiBUWVBFU19CWV9NSU1FX1NUUklORy5nZXQobWltZVR5cGUpIHx8IFVOUEFSU0VBQkxFX01JTUVfVFlQRTtcbiAgfVxuXG4gIC8qKiBAcmV0dXJuIHRoZSBieXRlIGlkZW50aWZpZXIgb2YgdGhlIG1pbWUgdHlwZSwgZ3VhcmFudGVlZCB0byBiZSBwb3NpdGl2ZSBvciB6ZXJvLiAqL1xuICBnZXQgaWRlbnRpZmllcigpIHtcbiAgICByZXR1cm4gdGhpcy5faWRlbnRpZmllcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJuIHRoZSBtaW1lIHR5cGUgcmVwcmVzZW50ZWQgYXMgYSB7QGxpbmsgU3RyaW5nfSwgd2hpY2ggaXMgbWFkZSBvZiBVU19BU0NJSSBjb21wYXRpYmxlXG4gICAqICAgICBjaGFyYWN0ZXJzIG9ubHlcbiAgICovXG4gIGdldCBzdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZztcbiAgfVxuXG4gIC8qKiBAc2VlICNnZXRTdHJpbmcoKSAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyaW5nO1xuICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBXZWxsS25vd25NaW1lVHlwZTtcblxuY29uc3QgVU5QQVJTRUFCTEVfTUlNRV9UWVBFID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnVU5QQVJTRUFCTEVfTUlNRV9UWVBFX0RPX05PVF9VU0UnLFxuICAtMlxuKTtcbmV4cG9ydHMuVU5QQVJTRUFCTEVfTUlNRV9UWVBFID0gVU5QQVJTRUFCTEVfTUlNRV9UWVBFO1xuXG5jb25zdCBVTktOT1dOX1JFU0VSVkVEX01JTUVfVFlQRSA9IG5ldyBXZWxsS25vd25NaW1lVHlwZShcbiAgJ1VOS05PV05fWUVUX1JFU0VSVkVEX0RPX05PVF9VU0UnLFxuICAtMVxuKTtcbmV4cG9ydHMuVU5LTk9XTl9SRVNFUlZFRF9NSU1FX1RZUEUgPSBVTktOT1dOX1JFU0VSVkVEX01JTUVfVFlQRTtcblxuY29uc3QgQVBQTElDQVRJT05fQVZSTyA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXBwbGljYXRpb24vYXZybycsIDB4MDApO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9BVlJPID0gQVBQTElDQVRJT05fQVZSTztcblxuY29uc3QgQVBQTElDQVRJT05fQ0JPUiA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXBwbGljYXRpb24vY2JvcicsIDB4MDEpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9DQk9SID0gQVBQTElDQVRJT05fQ0JPUjtcblxuY29uc3QgQVBQTElDQVRJT05fR1JBUEhRTCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXBwbGljYXRpb24vZ3JhcGhxbCcsIDB4MDIpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9HUkFQSFFMID0gQVBQTElDQVRJT05fR1JBUEhRTDtcblxuY29uc3QgQVBQTElDQVRJT05fR1pJUCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXBwbGljYXRpb24vZ3ppcCcsIDB4MDMpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9HWklQID0gQVBQTElDQVRJT05fR1pJUDtcblxuY29uc3QgQVBQTElDQVRJT05fSkFWQVNDUklQVCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZShcbiAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnLFxuICAweDA0XG4pO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9KQVZBU0NSSVBUID0gQVBQTElDQVRJT05fSkFWQVNDUklQVDtcblxuY29uc3QgQVBQTElDQVRJT05fSlNPTiA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXBwbGljYXRpb24vanNvbicsIDB4MDUpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9KU09OID0gQVBQTElDQVRJT05fSlNPTjtcblxuY29uc3QgQVBQTElDQVRJT05fT0NURVRfU1RSRUFNID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcbiAgMHgwNlxuKTtcbmV4cG9ydHMuQVBQTElDQVRJT05fT0NURVRfU1RSRUFNID0gQVBQTElDQVRJT05fT0NURVRfU1RSRUFNO1xuXG5jb25zdCBBUFBMSUNBVElPTl9QREYgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2FwcGxpY2F0aW9uL3BkZicsIDB4MDcpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9QREYgPSBBUFBMSUNBVElPTl9QREY7XG5cbmNvbnN0IEFQUExJQ0FUSU9OX1RIUklGVCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZShcbiAgJ2FwcGxpY2F0aW9uL3ZuZC5hcGFjaGUudGhyaWZ0LmJpbmFyeScsXG4gIDB4MDhcbik7XG5leHBvcnRzLkFQUExJQ0FUSU9OX1RIUklGVCA9IEFQUExJQ0FUSU9OX1RIUklGVDtcblxuY29uc3QgQVBQTElDQVRJT05fUFJPVE9CVUYgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoXG4gICdhcHBsaWNhdGlvbi92bmQuZ29vZ2xlLnByb3RvYnVmJyxcbiAgMHgwOVxuKTtcbmV4cG9ydHMuQVBQTElDQVRJT05fUFJPVE9CVUYgPSBBUFBMSUNBVElPTl9QUk9UT0JVRjtcblxuY29uc3QgQVBQTElDQVRJT05fWE1MID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdhcHBsaWNhdGlvbi94bWwnLCAweDBhKTtcbmV4cG9ydHMuQVBQTElDQVRJT05fWE1MID0gQVBQTElDQVRJT05fWE1MO1xuXG5jb25zdCBBUFBMSUNBVElPTl9aSVAgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2FwcGxpY2F0aW9uL3ppcCcsIDB4MGIpO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9aSVAgPSBBUFBMSUNBVElPTl9aSVA7XG5cbmNvbnN0IEFVRElPX0FBQyA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXVkaW8vYWFjJywgMHgwYyk7XG5leHBvcnRzLkFVRElPX0FBQyA9IEFVRElPX0FBQztcblxuY29uc3QgQVVESU9fTVAzID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdhdWRpby9tcDMnLCAweDBkKTtcbmV4cG9ydHMuQVVESU9fTVAzID0gQVVESU9fTVAzO1xuXG5jb25zdCBBVURJT19NUDQgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2F1ZGlvL21wNCcsIDB4MGUpO1xuZXhwb3J0cy5BVURJT19NUDQgPSBBVURJT19NUDQ7XG5cbmNvbnN0IEFVRElPX01QRUczID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdhdWRpby9tcGVnMycsIDB4MGYpO1xuZXhwb3J0cy5BVURJT19NUEVHMyA9IEFVRElPX01QRUczO1xuXG5jb25zdCBBVURJT19NUEVHID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdhdWRpby9tcGVnJywgMHgxMCk7XG5leHBvcnRzLkFVRElPX01QRUcgPSBBVURJT19NUEVHO1xuXG5jb25zdCBBVURJT19PR0cgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2F1ZGlvL29nZycsIDB4MTEpO1xuZXhwb3J0cy5BVURJT19PR0cgPSBBVURJT19PR0c7XG5cbmNvbnN0IEFVRElPX09QVVMgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2F1ZGlvL29wdXMnLCAweDEyKTtcbmV4cG9ydHMuQVVESU9fT1BVUyA9IEFVRElPX09QVVM7XG5cbmNvbnN0IEFVRElPX1ZPUkJJUyA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnYXVkaW8vdm9yYmlzJywgMHgxMyk7XG5leHBvcnRzLkFVRElPX1ZPUkJJUyA9IEFVRElPX1ZPUkJJUztcblxuY29uc3QgSU1BR0VfQk1QID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdpbWFnZS9ibXAnLCAweDE0KTtcbmV4cG9ydHMuSU1BR0VfQk1QID0gSU1BR0VfQk1QO1xuXG5jb25zdCBJTUFHRV9HSUcgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2dpZicsIDB4MTUpO1xuZXhwb3J0cy5JTUFHRV9HSUcgPSBJTUFHRV9HSUc7XG5cbmNvbnN0IElNQUdFX0hFSUNfU0VRVUVOQ0UgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2hlaWMtc2VxdWVuY2UnLCAweDE2KTtcbmV4cG9ydHMuSU1BR0VfSEVJQ19TRVFVRU5DRSA9IElNQUdFX0hFSUNfU0VRVUVOQ0U7XG5cbmNvbnN0IElNQUdFX0hFSUMgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2hlaWMnLCAweDE3KTtcbmV4cG9ydHMuSU1BR0VfSEVJQyA9IElNQUdFX0hFSUM7XG5cbmNvbnN0IElNQUdFX0hFSUZfU0VRVUVOQ0UgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2hlaWYtc2VxdWVuY2UnLCAweDE4KTtcbmV4cG9ydHMuSU1BR0VfSEVJRl9TRVFVRU5DRSA9IElNQUdFX0hFSUZfU0VRVUVOQ0U7XG5cbmNvbnN0IElNQUdFX0hFSUYgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2hlaWYnLCAweDE5KTtcbmV4cG9ydHMuSU1BR0VfSEVJRiA9IElNQUdFX0hFSUY7XG5cbmNvbnN0IElNQUdFX0pQRUcgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ2ltYWdlL2pwZWcnLCAweDFhKTtcbmV4cG9ydHMuSU1BR0VfSlBFRyA9IElNQUdFX0pQRUc7XG5cbmNvbnN0IElNQUdFX1BORyA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnaW1hZ2UvcG5nJywgMHgxYik7XG5leHBvcnRzLklNQUdFX1BORyA9IElNQUdFX1BORztcblxuY29uc3QgSU1BR0VfVElGRiA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgnaW1hZ2UvdGlmZicsIDB4MWMpO1xuZXhwb3J0cy5JTUFHRV9USUZGID0gSU1BR0VfVElGRjtcblxuY29uc3QgTVVMVElQQVJUX01JWEVEID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKCdtdWx0aXBhcnQvbWl4ZWQnLCAweDFkKTtcbmV4cG9ydHMuTVVMVElQQVJUX01JWEVEID0gTVVMVElQQVJUX01JWEVEO1xuXG5jb25zdCBURVhUX0NTUyA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgndGV4dC9jc3MnLCAweDFlKTtcbmV4cG9ydHMuVEVYVF9DU1MgPSBURVhUX0NTUztcblxuY29uc3QgVEVYVF9DU1YgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ3RleHQvY3N2JywgMHgxZik7XG5leHBvcnRzLlRFWFRfQ1NWID0gVEVYVF9DU1Y7XG5cbmNvbnN0IFRFWFRfSFRNTCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgndGV4dC9odG1sJywgMHgyMCk7XG5leHBvcnRzLlRFWFRfSFRNTCA9IFRFWFRfSFRNTDtcblxuY29uc3QgVEVYVF9QTEFJTiA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgndGV4dC9wbGFpbicsIDB4MjEpO1xuZXhwb3J0cy5URVhUX1BMQUlOID0gVEVYVF9QTEFJTjtcblxuY29uc3QgVEVYVF9YTUwgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ3RleHQveG1sJywgMHgyMik7XG5leHBvcnRzLlRFWFRfWE1MID0gVEVYVF9YTUw7XG5cbmNvbnN0IFZJREVPX0gyNjQgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ3ZpZGVvL0gyNjQnLCAweDIzKTtcbmV4cG9ydHMuVklERU9fSDI2NCA9IFZJREVPX0gyNjQ7XG5cbmNvbnN0IFZJREVPX0gyNjUgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoJ3ZpZGVvL0gyNjUnLCAweDI0KTtcbmV4cG9ydHMuVklERU9fSDI2NSA9IFZJREVPX0gyNjU7XG5cbmNvbnN0IFZJREVPX1ZQOCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZSgndmlkZW8vVlA4JywgMHgyNSk7XG5leHBvcnRzLlZJREVPX1ZQOCA9IFZJREVPX1ZQODtcblxuY29uc3QgQVBQTElDQVRJT05fSEVTU0lBTiA9IG5ldyBXZWxsS25vd25NaW1lVHlwZShcbiAgJ2FwcGxpY2F0aW9uL3gtaGVzc2lhbicsXG4gIDB4MjZcbik7XG5leHBvcnRzLkFQUExJQ0FUSU9OX0hFU1NJQU4gPSBBUFBMSUNBVElPTl9IRVNTSUFOO1xuXG5jb25zdCBBUFBMSUNBVElPTl9KQVZBX09CSkVDVCA9IG5ldyBXZWxsS25vd25NaW1lVHlwZShcbiAgJ2FwcGxpY2F0aW9uL3gtamF2YS1vYmplY3QnLFxuICAweDI3XG4pO1xuZXhwb3J0cy5BUFBMSUNBVElPTl9KQVZBX09CSkVDVCA9IEFQUExJQ0FUSU9OX0pBVkFfT0JKRUNUO1xuXG5jb25zdCBBUFBMSUNBVElPTl9DTE9VREVWRU5UU19KU09OID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnYXBwbGljYXRpb24vY2xvdWRldmVudHMranNvbicsXG4gIDB4Mjhcbik7XG5cbi8vIC4uLiByZXNlcnZlZCBmb3IgZnV0dXJlIHVzZSAuLi5cbmV4cG9ydHMuQVBQTElDQVRJT05fQ0xPVURFVkVOVFNfSlNPTiA9IEFQUExJQ0FUSU9OX0NMT1VERVZFTlRTX0pTT047XG5jb25zdCBNRVNTQUdFX1JTT0NLRVRfTUlNRVRZUEUgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoXG4gICdtZXNzYWdlL3gucnNvY2tldC5taW1lLXR5cGUudjAnLFxuICAweDdhXG4pO1xuZXhwb3J0cy5NRVNTQUdFX1JTT0NLRVRfTUlNRVRZUEUgPSBNRVNTQUdFX1JTT0NLRVRfTUlNRVRZUEU7XG5cbmNvbnN0IE1FU1NBR0VfUlNPQ0tFVF9BQ0NFUFRfTUlNRVRZUEVTID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnbWVzc2FnZS94LnJzb2NrZXQuYWNjZXB0LW1pbWUtdHlwZXMudjAnLFxuICAweDdiXG4pO1xuZXhwb3J0cy5NRVNTQUdFX1JTT0NLRVRfQUNDRVBUX01JTUVUWVBFUyA9IE1FU1NBR0VfUlNPQ0tFVF9BQ0NFUFRfTUlNRVRZUEVTO1xuXG5jb25zdCBNRVNTQUdFX1JTT0NLRVRfQVVUSEVOVElDQVRJT04gPSBuZXcgV2VsbEtub3duTWltZVR5cGUoXG4gICdtZXNzYWdlL3gucnNvY2tldC5hdXRoZW50aWNhdGlvbi52MCcsXG4gIDB4N2Ncbik7XG5leHBvcnRzLk1FU1NBR0VfUlNPQ0tFVF9BVVRIRU5USUNBVElPTiA9IE1FU1NBR0VfUlNPQ0tFVF9BVVRIRU5USUNBVElPTjtcblxuY29uc3QgTUVTU0FHRV9SU09DS0VUX1RSQUNJTkdfWklQS0lOID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnbWVzc2FnZS94LnJzb2NrZXQudHJhY2luZy16aXBraW4udjAnLFxuICAweDdkXG4pO1xuZXhwb3J0cy5NRVNTQUdFX1JTT0NLRVRfVFJBQ0lOR19aSVBLSU4gPSBNRVNTQUdFX1JTT0NLRVRfVFJBQ0lOR19aSVBLSU47XG5cbmNvbnN0IE1FU1NBR0VfUlNPQ0tFVF9ST1VUSU5HID0gbmV3IFdlbGxLbm93bk1pbWVUeXBlKFxuICAnbWVzc2FnZS94LnJzb2NrZXQucm91dGluZy52MCcsXG4gIDB4N2Vcbik7XG5leHBvcnRzLk1FU1NBR0VfUlNPQ0tFVF9ST1VUSU5HID0gTUVTU0FHRV9SU09DS0VUX1JPVVRJTkc7XG5cbmNvbnN0IE1FU1NBR0VfUlNPQ0tFVF9DT01QT1NJVEVfTUVUQURBVEEgPSBuZXcgV2VsbEtub3duTWltZVR5cGUoXG4gICdtZXNzYWdlL3gucnNvY2tldC5jb21wb3NpdGUtbWV0YWRhdGEudjAnLFxuICAweDdmXG4pO1xuZXhwb3J0cy5NRVNTQUdFX1JTT0NLRVRfQ09NUE9TSVRFX01FVEFEQVRBID0gTUVTU0FHRV9SU09DS0VUX0NPTVBPU0lURV9NRVRBREFUQTtcblxuY29uc3QgVFlQRVNfQllfTUlNRV9JRCA9IG5ldyBBcnJheSgxMjgpO1xuZXhwb3J0cy5UWVBFU19CWV9NSU1FX0lEID0gVFlQRVNfQllfTUlNRV9JRDtcbmNvbnN0IFRZUEVTX0JZX01JTUVfU1RSSU5HID0gbmV3IE1hcCgpO1xuZXhwb3J0cy5UWVBFU19CWV9NSU1FX1NUUklORyA9IFRZUEVTX0JZX01JTUVfU1RSSU5HO1xuXG5jb25zdCBBTExfTUlNRV9UWVBFUyA9IFtcbiAgVU5QQVJTRUFCTEVfTUlNRV9UWVBFLFxuICBVTktOT1dOX1JFU0VSVkVEX01JTUVfVFlQRSxcbiAgQVBQTElDQVRJT05fQVZSTyxcbiAgQVBQTElDQVRJT05fQ0JPUixcbiAgQVBQTElDQVRJT05fR1JBUEhRTCxcbiAgQVBQTElDQVRJT05fR1pJUCxcbiAgQVBQTElDQVRJT05fSkFWQVNDUklQVCxcbiAgQVBQTElDQVRJT05fSlNPTixcbiAgQVBQTElDQVRJT05fT0NURVRfU1RSRUFNLFxuICBBUFBMSUNBVElPTl9QREYsXG4gIEFQUExJQ0FUSU9OX1RIUklGVCxcbiAgQVBQTElDQVRJT05fUFJPVE9CVUYsXG4gIEFQUExJQ0FUSU9OX1hNTCxcbiAgQVBQTElDQVRJT05fWklQLFxuICBBVURJT19BQUMsXG4gIEFVRElPX01QMyxcbiAgQVVESU9fTVA0LFxuICBBVURJT19NUEVHMyxcbiAgQVVESU9fTVBFRyxcbiAgQVVESU9fT0dHLFxuICBBVURJT19PUFVTLFxuICBBVURJT19WT1JCSVMsXG4gIElNQUdFX0JNUCxcbiAgSU1BR0VfR0lHLFxuICBJTUFHRV9IRUlDX1NFUVVFTkNFLFxuICBJTUFHRV9IRUlDLFxuICBJTUFHRV9IRUlGX1NFUVVFTkNFLFxuICBJTUFHRV9IRUlGLFxuICBJTUFHRV9KUEVHLFxuICBJTUFHRV9QTkcsXG4gIElNQUdFX1RJRkYsXG4gIE1VTFRJUEFSVF9NSVhFRCxcbiAgVEVYVF9DU1MsXG4gIFRFWFRfQ1NWLFxuICBURVhUX0hUTUwsXG4gIFRFWFRfUExBSU4sXG4gIFRFWFRfWE1MLFxuICBWSURFT19IMjY0LFxuICBWSURFT19IMjY1LFxuICBWSURFT19WUDgsXG4gIEFQUExJQ0FUSU9OX0hFU1NJQU4sXG4gIEFQUExJQ0FUSU9OX0pBVkFfT0JKRUNULFxuICBBUFBMSUNBVElPTl9DTE9VREVWRU5UU19KU09OLFxuICBNRVNTQUdFX1JTT0NLRVRfTUlNRVRZUEUsXG4gIE1FU1NBR0VfUlNPQ0tFVF9BQ0NFUFRfTUlNRVRZUEVTLFxuICBNRVNTQUdFX1JTT0NLRVRfQVVUSEVOVElDQVRJT04sXG4gIE1FU1NBR0VfUlNPQ0tFVF9UUkFDSU5HX1pJUEtJTixcbiAgTUVTU0FHRV9SU09DS0VUX1JPVVRJTkcsXG4gIE1FU1NBR0VfUlNPQ0tFVF9DT01QT1NJVEVfTUVUQURBVEEsXG5dO1xuXG5UWVBFU19CWV9NSU1FX0lELmZpbGwoVU5LTk9XTl9SRVNFUlZFRF9NSU1FX1RZUEUpO1xuXG5mb3IgKGNvbnN0IHZhbHVlIG9mIEFMTF9NSU1FX1RZUEVTKSB7XG4gIGlmICh2YWx1ZS5pZGVudGlmaWVyID49IDApIHtcbiAgICBUWVBFU19CWV9NSU1FX0lEW3ZhbHVlLmlkZW50aWZpZXJdID0gdmFsdWU7XG4gICAgVFlQRVNfQllfTUlNRV9TVFJJTkcuc2V0KHZhbHVlLnN0cmluZywgdmFsdWUpO1xuICB9XG59XG5cbmlmIChPYmplY3Quc2VhbCkge1xuICBPYmplY3Quc2VhbChUWVBFU19CWV9NSU1FX0lEKTtcbn1cbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnUlNvY2tldENsaWVudCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0Q2xpZW50LmRlZmF1bHQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnUlNvY2tldFNlcnZlcicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0U2VydmVyLmRlZmF1bHQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnUlNvY2tldFJlc3VtYWJsZVRyYW5zcG9ydCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0UmVzdW1hYmxlVHJhbnNwb3J0LmRlZmF1bHQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnV2VsbEtub3duTWltZVR5cGUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuZGVmYXVsdDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdVTlBBUlNFQUJMRV9NSU1FX1RZUEUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuVU5QQVJTRUFCTEVfTUlNRV9UWVBFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1VOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlVOS05PV05fUkVTRVJWRURfTUlNRV9UWVBFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FQUExJQ0FUSU9OX0FWUk8nLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuQVBQTElDQVRJT05fQVZSTztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBUFBMSUNBVElPTl9DQk9SJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX0NCT1I7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fR1JBUEhRTCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BUFBMSUNBVElPTl9HUkFQSFFMO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FQUExJQ0FUSU9OX0daSVAnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuQVBQTElDQVRJT05fR1pJUDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBUFBMSUNBVElPTl9KQVZBU0NSSVBUJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX0pBVkFTQ1JJUFQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fSlNPTicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BUFBMSUNBVElPTl9KU09OO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FQUExJQ0FUSU9OX09DVEVUX1NUUkVBTScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BUFBMSUNBVElPTl9PQ1RFVF9TVFJFQU07XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fUERGJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX1BERjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBUFBMSUNBVElPTl9USFJJRlQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuQVBQTElDQVRJT05fVEhSSUZUO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FQUExJQ0FUSU9OX1BST1RPQlVGJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX1BST1RPQlVGO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FQUExJQ0FUSU9OX1hNTCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BUFBMSUNBVElPTl9YTUw7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fWklQJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX1pJUDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBVURJT19BQUMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuQVVESU9fQUFDO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0FVRElPX01QMycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BVURJT19NUDM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVVESU9fTVA0Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFVRElPX01QNDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBVURJT19NUEVHMycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BVURJT19NUEVHMztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBVURJT19NUEVHJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFVRElPX01QRUc7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVVESU9fT0dHJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFVRElPX09HRztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBVURJT19PUFVTJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFVRElPX09QVVM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVVESU9fVk9SQklTJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFVRElPX1ZPUkJJUztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdJTUFHRV9CTVAnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuSU1BR0VfQk1QO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0lNQUdFX0dJRycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5JTUFHRV9HSUc7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnSU1BR0VfSEVJQ19TRVFVRU5DRScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5JTUFHRV9IRUlDX1NFUVVFTkNFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0lNQUdFX0hFSUMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuSU1BR0VfSEVJQztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdJTUFHRV9IRUlGX1NFUVVFTkNFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLklNQUdFX0hFSUZfU0VRVUVOQ0U7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnSU1BR0VfSEVJRicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5JTUFHRV9IRUlGO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0lNQUdFX0pQRUcnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuSU1BR0VfSlBFRztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdJTUFHRV9QTkcnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuSU1BR0VfUE5HO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0lNQUdFX1RJRkYnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuSU1BR0VfVElGRjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdNVUxUSVBBUlRfTUlYRUQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuTVVMVElQQVJUX01JWEVEO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1RFWFRfQ1NTJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlRFWFRfQ1NTO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1RFWFRfQ1NWJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlRFWFRfQ1NWO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1RFWFRfSFRNTCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5URVhUX0hUTUw7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnVEVYVF9QTEFJTicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5URVhUX1BMQUlOO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1RFWFRfWE1MJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlRFWFRfWE1MO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1ZJREVPX0gyNjQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuVklERU9fSDI2NDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdWSURFT19IMjY1Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlZJREVPX0gyNjU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnVklERU9fVlA4Jywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLlZJREVPX1ZQODtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdBUFBMSUNBVElPTl9IRVNTSUFOJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLkFQUExJQ0FUSU9OX0hFU1NJQU47XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fSkFWQV9PQkpFQ1QnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuQVBQTElDQVRJT05fSkFWQV9PQkpFQ1Q7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnQVBQTElDQVRJT05fQ0xPVURFVkVOVFNfSlNPTicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5BUFBMSUNBVElPTl9DTE9VREVWRU5UU19KU09OO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01FU1NBR0VfUlNPQ0tFVF9NSU1FVFlQRScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25NaW1lVHlwZS5NRVNTQUdFX1JTT0NLRVRfTUlNRVRZUEU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnTUVTU0FHRV9SU09DS0VUX0FDQ0VQVF9NSU1FVFlQRVMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuTUVTU0FHRV9SU09DS0VUX0FDQ0VQVF9NSU1FVFlQRVM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnTUVTU0FHRV9SU09DS0VUX0FVVEhFTlRJQ0FUSU9OJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLk1FU1NBR0VfUlNPQ0tFVF9BVVRIRU5USUNBVElPTjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdNRVNTQUdFX1JTT0NLRVRfVFJBQ0lOR19aSVBLSU4nLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuTUVTU0FHRV9SU09DS0VUX1RSQUNJTkdfWklQS0lOO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01FU1NBR0VfUlNPQ0tFVF9ST1VUSU5HJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bk1pbWVUeXBlLk1FU1NBR0VfUlNPQ0tFVF9ST1VUSU5HO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01FU1NBR0VfUlNPQ0tFVF9DT01QT1NJVEVfTUVUQURBVEEnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duTWltZVR5cGUuTUVTU0FHRV9SU09DS0VUX0NPTVBPU0lURV9NRVRBREFUQTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdXZWxsS25vd25BdXRoVHlwZScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25BdXRoVHlwZS5kZWZhdWx0O1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1VOUEFSU0VBQkxFX0FVVEhfVFlQRScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9XZWxsS25vd25BdXRoVHlwZS5VTlBBUlNFQUJMRV9BVVRIX1RZUEU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnVU5LTk9XTl9SRVNFUlZFRF9BVVRIX1RZUEUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duQXV0aFR5cGUuVU5LTk9XTl9SRVNFUlZFRF9BVVRIX1RZUEU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnU0lNUExFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1dlbGxLbm93bkF1dGhUeXBlLlNJTVBMRTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdCRUFSRVInLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfV2VsbEtub3duQXV0aFR5cGUuQkVBUkVSO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0NPTk5FQ1RJT05fU1RSRUFNX0lEJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5DT05ORUNUSU9OX1NUUkVBTV9JRDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdFUlJPUl9DT0RFUycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuRVJST1JfQ09ERVM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnRVJST1JfRVhQTEFOQVRJT05TJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5FUlJPUl9FWFBMQU5BVElPTlM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnRkxBR1NfTUFTSycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuRkxBR1NfTUFTSztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdGTEFHUycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuRkxBR1M7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnRlJBTUVfVFlQRV9PRkZGU0VUJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5GUkFNRV9UWVBFX09GRkZTRVQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnRlJBTUVfVFlQRVMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLkZSQU1FX1RZUEVTO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01BWF9DT0RFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5NQVhfQ09ERTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdNQVhfS0VFUEFMSVZFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5NQVhfS0VFUEFMSVZFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01BWF9MSUZFVElNRScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuTUFYX0xJRkVUSU1FO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01BWF9NSU1FX0xFTkdUSCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuTUFYX01JTUVfTEVOR1RIO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01BWF9SRVNVTUVfTEVOR1RIJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5NQVhfUkVTVU1FX0xFTkdUSDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdNQVhfU1RSRUFNX0lEJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5NQVhfU1RSRUFNX0lEO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ01BWF9WRVJTSU9OJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRGcmFtZS5NQVhfVkVSU0lPTjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdjcmVhdGVFcnJvckZyb21GcmFtZScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuY3JlYXRlRXJyb3JGcm9tRnJhbWU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnZ2V0RXJyb3JDb2RlRXhwbGFuYXRpb24nLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmdldEVycm9yQ29kZUV4cGxhbmF0aW9uO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2lzQ29tcGxldGUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmlzQ29tcGxldGU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnaXNJZ25vcmUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmlzSWdub3JlO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2lzTGVhc2UnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmlzTGVhc2U7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnaXNNZXRhZGF0YScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuaXNNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdpc05leHQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmlzTmV4dDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdpc1Jlc3BvbmQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEZyYW1lLmlzUmVzcG9uZDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdpc1Jlc3VtZUVuYWJsZScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUuaXNSZXN1bWVFbmFibGU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAncHJpbnRGcmFtZScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RnJhbWUucHJpbnRGcmFtZTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdkZXNlcmlhbGl6ZUZyYW1lJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRCaW5hcnlGcmFtaW5nLmRlc2VyaWFsaXplRnJhbWU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnZGVzZXJpYWxpemVGcmFtZVdpdGhMZW5ndGgnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEJpbmFyeUZyYW1pbmcuZGVzZXJpYWxpemVGcmFtZVdpdGhMZW5ndGg7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnZGVzZXJpYWxpemVGcmFtZXMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEJpbmFyeUZyYW1pbmcuZGVzZXJpYWxpemVGcmFtZXM7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnc2VyaWFsaXplRnJhbWUnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldEJpbmFyeUZyYW1pbmcuc2VyaWFsaXplRnJhbWU7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnc2VyaWFsaXplRnJhbWVXaXRoTGVuZ3RoJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRCaW5hcnlGcmFtaW5nLnNlcmlhbGl6ZUZyYW1lV2l0aExlbmd0aDtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdieXRlTGVuZ3RoJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRCdWZmZXJVdGlscy5ieXRlTGVuZ3RoO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2NyZWF0ZUJ1ZmZlcicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0QnVmZmVyVXRpbHMuY3JlYXRlQnVmZmVyO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ3JlYWRVSW50MjRCRScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0QnVmZmVyVXRpbHMucmVhZFVJbnQyNEJFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ3RvQnVmZmVyJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRCdWZmZXJVdGlscy50b0J1ZmZlcjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICd3cml0ZVVJbnQyNEJFJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRCdWZmZXJVdGlscy53cml0ZVVJbnQyNEJFO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0J1ZmZlckVuY29kZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRFbmNvZGluZy5CdWZmZXJFbmNvZGVycztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdCdWZmZXJFbmNvZGVyJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRFbmNvZGluZy5CdWZmZXJFbmNvZGVyO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1V0ZjhFbmNvZGVycycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0RW5jb2RpbmcuVXRmOEVuY29kZXJzO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1VURjhFbmNvZGVyJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRFbmNvZGluZy5VVEY4RW5jb2RlcjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdJZGVudGl0eVNlcmlhbGl6ZXInLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldFNlcmlhbGl6YXRpb24uSWRlbnRpdHlTZXJpYWxpemVyO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0lkZW50aXR5U2VyaWFsaXplcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldFNlcmlhbGl6YXRpb24uSWRlbnRpdHlTZXJpYWxpemVycztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdKc29uU2VyaWFsaXplcicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0U2VyaWFsaXphdGlvbi5Kc29uU2VyaWFsaXplcjtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdKc29uU2VyaWFsaXplcnMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUlNvY2tldFNlcmlhbGl6YXRpb24uSnNvblNlcmlhbGl6ZXJzO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0xlYXNlcycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9SU29ja2V0TGVhc2UuTGVhc2VzO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0xlYXNlJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JTb2NrZXRMZWFzZS5MZWFzZTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdDb21wb3NpdGVNZXRhZGF0YScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9Db21wb3NpdGVNZXRhZGF0YS5Db21wb3NpdGVNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdSZXNlcnZlZE1pbWVUeXBlRW50cnknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQ29tcG9zaXRlTWV0YWRhdGEuUmVzZXJ2ZWRNaW1lVHlwZUVudHJ5O1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1dlbGxLbm93bk1pbWVUeXBlRW50cnknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQ29tcG9zaXRlTWV0YWRhdGEuV2VsbEtub3duTWltZVR5cGVFbnRyeTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdFeHBsaWNpdE1pbWVUaW1lRW50cnknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQ29tcG9zaXRlTWV0YWRhdGEuRXhwbGljaXRNaW1lVGltZUVudHJ5O1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2VuY29kZUFuZEFkZEN1c3RvbU1ldGFkYXRhJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0NvbXBvc2l0ZU1ldGFkYXRhLmVuY29kZUFuZEFkZEN1c3RvbU1ldGFkYXRhO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2VuY29kZUFuZEFkZFdlbGxLbm93bk1ldGFkYXRhJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0NvbXBvc2l0ZU1ldGFkYXRhLmVuY29kZUFuZEFkZFdlbGxLbm93bk1ldGFkYXRhO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2VuY29kZUNvbXBvc2l0ZU1ldGFkYXRhJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0NvbXBvc2l0ZU1ldGFkYXRhLmVuY29kZUNvbXBvc2l0ZU1ldGFkYXRhO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2RlY29kZUNvbXBvc2l0ZU1ldGFkYXRhJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0NvbXBvc2l0ZU1ldGFkYXRhLmRlY29kZUNvbXBvc2l0ZU1ldGFkYXRhO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ1JvdXRpbmdNZXRhZGF0YScsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9Sb3V0aW5nTWV0YWRhdGEuUm91dGluZ01ldGFkYXRhO1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2VuY29kZVJvdXRlJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1JvdXRpbmdNZXRhZGF0YS5lbmNvZGVSb3V0ZTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdlbmNvZGVSb3V0ZXMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUm91dGluZ01ldGFkYXRhLmVuY29kZVJvdXRlcztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdkZWNvZGVSb3V0ZXMnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfUm91dGluZ01ldGFkYXRhLmRlY29kZVJvdXRlcztcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdlbmNvZGVTaW1wbGVBdXRoTWV0YWRhdGEnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQXV0aE1ldGFkYXRhLmVuY29kZVNpbXBsZUF1dGhNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdlbmNvZGVCZWFyZXJBdXRoTWV0YWRhdGEnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQXV0aE1ldGFkYXRhLmVuY29kZUJlYXJlckF1dGhNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdlbmNvZGVXZWxsS25vd25BdXRoTWV0YWRhdGEnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQXV0aE1ldGFkYXRhLmVuY29kZVdlbGxLbm93bkF1dGhNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdlbmNvZGVDdXN0b21BdXRoTWV0YWRhdGEnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfQXV0aE1ldGFkYXRhLmVuY29kZUN1c3RvbUF1dGhNZXRhZGF0YTtcbiAgfSxcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdkZWNvZGVTaW1wbGVBdXRoUGF5bG9hZCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9BdXRoTWV0YWRhdGEuZGVjb2RlU2ltcGxlQXV0aFBheWxvYWQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnZGVjb2RlQXV0aE1ldGFkYXRhJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0F1dGhNZXRhZGF0YS5kZWNvZGVBdXRoTWV0YWRhdGE7XG4gIH0sXG59KTtcblxudmFyIF9SU29ja2V0Q2xpZW50ID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL1JTb2NrZXRDbGllbnQnKSk7XG5cbnZhciBfUlNvY2tldFNlcnZlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9SU29ja2V0U2VydmVyJykpO1xuXG52YXIgX1JTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KFxuICByZXF1aXJlKCcuL1JTb2NrZXRSZXN1bWFibGVUcmFuc3BvcnQnKVxuKTtcblxudmFyIF9XZWxsS25vd25NaW1lVHlwZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKFxuICByZXF1aXJlKCcuL1dlbGxLbm93bk1pbWVUeXBlJylcbik7XG5cbnZhciBfV2VsbEtub3duQXV0aFR5cGUgPSBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChcbiAgcmVxdWlyZSgnLi9XZWxsS25vd25BdXRoVHlwZScpXG4pO1xuXG52YXIgX1JTb2NrZXRGcmFtZSA9IHJlcXVpcmUoJy4vUlNvY2tldEZyYW1lJyk7XG5cbnZhciBfUlNvY2tldEJpbmFyeUZyYW1pbmcgPSByZXF1aXJlKCcuL1JTb2NrZXRCaW5hcnlGcmFtaW5nJyk7XG5cbnZhciBfUlNvY2tldEJ1ZmZlclV0aWxzID0gcmVxdWlyZSgnLi9SU29ja2V0QnVmZmVyVXRpbHMnKTtcblxudmFyIF9SU29ja2V0RW5jb2RpbmcgPSByZXF1aXJlKCcuL1JTb2NrZXRFbmNvZGluZycpO1xuXG52YXIgX1JTb2NrZXRTZXJpYWxpemF0aW9uID0gcmVxdWlyZSgnLi9SU29ja2V0U2VyaWFsaXphdGlvbicpO1xuXG52YXIgX1JTb2NrZXRMZWFzZSA9IHJlcXVpcmUoJy4vUlNvY2tldExlYXNlJyk7XG5cbnZhciBfQ29tcG9zaXRlTWV0YWRhdGEgPSByZXF1aXJlKCcuL0NvbXBvc2l0ZU1ldGFkYXRhJyk7XG5cbnZhciBfUm91dGluZ01ldGFkYXRhID0gcmVxdWlyZSgnLi9Sb3V0aW5nTWV0YWRhdGEnKTtcblxudmFyIF9BdXRoTWV0YWRhdGEgPSByZXF1aXJlKCcuL0F1dGhNZXRhZGF0YScpO1xuZnVuY3Rpb24gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCkge1xuICBpZiAodHlwZW9mIFdlYWtNYXAgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsO1xuICB2YXIgY2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuICBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGNhY2hlO1xuICB9O1xuICByZXR1cm4gY2FjaGU7XG59XG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJykpIHtcbiAgICByZXR1cm4ge2RlZmF1bHQ6IG9ian07XG4gIH1cbiAgdmFyIGNhY2hlID0gX2dldFJlcXVpcmVXaWxkY2FyZENhY2hlKCk7XG4gIGlmIChjYWNoZSAmJiBjYWNoZS5oYXMob2JqKSkge1xuICAgIHJldHVybiBjYWNoZS5nZXQob2JqKTtcbiAgfVxuICB2YXIgbmV3T2JqID0ge307XG4gIHZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3IgPVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIHZhciBkZXNjID0gaGFzUHJvcGVydHlEZXNjcmlwdG9yXG4gICAgICAgID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSlcbiAgICAgICAgOiBudWxsO1xuICAgICAgaWYgKGRlc2MgJiYgKGRlc2MuZ2V0IHx8IGRlc2Muc2V0KSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqLCBrZXksIGRlc2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gIGlmIChjYWNoZSkge1xuICAgIGNhY2hlLnNldChvYmosIG5ld09iaik7XG4gIH1cbiAgcmV0dXJuIG5ld09iajtcbn1cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcblxudmFyIF9GbG93YWJsZU1hcE9wZXJhdG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChcbiAgcmVxdWlyZSgnLi9GbG93YWJsZU1hcE9wZXJhdG9yJylcbik7XG52YXIgX0Zsb3dhYmxlVGFrZU9wZXJhdG9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChcbiAgcmVxdWlyZSgnLi9GbG93YWJsZVRha2VPcGVyYXRvcicpXG4pO1xudmFyIF9JbnZhcmlhbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoJy4vSW52YXJpYW50JykpO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIHRoZSBSZWFjdGl2ZVN0cmVhbSBgUHVibGlzaGVyYCBpbnRlcmZhY2Ugd2l0aCBSeC1zdHlsZSBvcGVyYXRvcnMuXG4gKi9cbmNsYXNzIEZsb3dhYmxlIHtcbiAgc3RhdGljIGp1c3QoLi4udmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBGbG93YWJsZSgoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuICAgICAgbGV0IGkgPSAwO1xuICAgICAgc3Vic2NyaWJlci5vblN1YnNjcmliZSh7XG4gICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgIGNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVlc3Q6IChuKSA9PiB7XG4gICAgICAgICAgd2hpbGUgKCFjYW5jZWxsZWQgJiYgbiA+IDAgJiYgaSA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZXIub25OZXh0KHZhbHVlc1tpKytdKTtcbiAgICAgICAgICAgIG4tLTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFjYW5jZWxsZWQgJiYgaSA9PSB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVyLm9uQ29tcGxldGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBlcnJvcihlcnJvcikge1xuICAgIHJldHVybiBuZXcgRmxvd2FibGUoKHN1YnNjcmliZXIpID0+IHtcbiAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoe1xuICAgICAgICBjYW5jZWw6ICgpID0+IHt9LFxuICAgICAgICByZXF1ZXN0OiAoKSA9PiB7XG4gICAgICAgICAgc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG5ldmVyKCkge1xuICAgIHJldHVybiBuZXcgRmxvd2FibGUoKHN1YnNjcmliZXIpID0+IHtcbiAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoe1xuICAgICAgICBjYW5jZWw6ICgpID0+IHt9LFxuICAgICAgICByZXF1ZXN0OiAoKSA9PiB7fSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgY29uc3RydWN0b3Ioc291cmNlLCBtYXggPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikge1xuICAgIHRoaXMuX21heCA9IG1heDtcbiAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gIH1cblxuICBzdWJzY3JpYmUoc3Vic2NyaWJlck9yQ2FsbGJhY2spIHtcbiAgICBsZXQgcGFydGlhbFN1YnNjcmliZXI7XG4gICAgaWYgKHR5cGVvZiBzdWJzY3JpYmVyT3JDYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcGFydGlhbFN1YnNjcmliZXIgPSB0aGlzLl93cmFwQ2FsbGJhY2soc3Vic2NyaWJlck9yQ2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0aWFsU3Vic2NyaWJlciA9IHN1YnNjcmliZXJPckNhbGxiYWNrO1xuICAgIH1cbiAgICBjb25zdCBzdWJzY3JpYmVyID0gbmV3IEZsb3dhYmxlU3Vic2NyaWJlcihwYXJ0aWFsU3Vic2NyaWJlciwgdGhpcy5fbWF4KTtcbiAgICB0aGlzLl9zb3VyY2Uoc3Vic2NyaWJlcik7XG4gIH1cblxuICBsaWZ0KG9uU3Vic2NyaWJlTGlmdCkge1xuICAgIHJldHVybiBuZXcgRmxvd2FibGUoKHN1YnNjcmliZXIpID0+XG4gICAgICB0aGlzLl9zb3VyY2Uob25TdWJzY3JpYmVMaWZ0KHN1YnNjcmliZXIpKVxuICAgICk7XG4gIH1cblxuICBtYXAoZm4pIHtcbiAgICByZXR1cm4gdGhpcy5saWZ0KFxuICAgICAgKHN1YnNjcmliZXIpID0+IG5ldyBfRmxvd2FibGVNYXBPcGVyYXRvci5kZWZhdWx0KHN1YnNjcmliZXIsIGZuKVxuICAgICk7XG4gIH1cblxuICB0YWtlKHRvVGFrZSkge1xuICAgIHJldHVybiB0aGlzLmxpZnQoXG4gICAgICAoc3Vic2NyaWJlcikgPT4gbmV3IF9GbG93YWJsZVRha2VPcGVyYXRvci5kZWZhdWx0KHN1YnNjcmliZXIsIHRvVGFrZSlcbiAgICApO1xuICB9XG5cbiAgX3dyYXBDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIGNvbnN0IG1heCA9IHRoaXMuX21heDtcbiAgICByZXR1cm4ge1xuICAgICAgb25OZXh0OiBjYWxsYmFjayxcbiAgICAgIG9uU3Vic2NyaWJlKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChtYXgpO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqLyBleHBvcnRzLmRlZmF1bHQgPSBGbG93YWJsZTtcbmNsYXNzIEZsb3dhYmxlU3Vic2NyaWJlciB7XG4gIGNvbnN0cnVjdG9yKHN1YnNjcmliZXIsIG1heCkge1xuICAgIF9kZWZpbmVQcm9wZXJ0eShcbiAgICAgIHRoaXMsXG4gICAgICAnX2NhbmNlbCcsXG5cbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShcbiAgICAgIHRoaXMsXG4gICAgICAnX3JlcXVlc3QnLFxuXG4gICAgICAobikgPT4ge1xuICAgICAgICAoMCwgX0ludmFyaWFudC5kZWZhdWx0KShcbiAgICAgICAgICBOdW1iZXIuaXNJbnRlZ2VyKG4pICYmIG4gPj0gMSAmJiBuIDw9IHRoaXMuX21heCxcbiAgICAgICAgICAnRmxvd2FibGU6IEV4cGVjdGVkIHJlcXVlc3QgdmFsdWUgdG8gYmUgYW4gaW50ZWdlciB3aXRoIGEgJyArXG4gICAgICAgICAgICAndmFsdWUgZ3JlYXRlciB0aGFuIDAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byAlcywgZ290ICcgK1xuICAgICAgICAgICAgJ2Alc2AuJyxcbiAgICAgICAgICB0aGlzLl9tYXgsXG4gICAgICAgICAgblxuICAgICAgICApO1xuXG4gICAgICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuID09PSB0aGlzLl9tYXgpIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nID0gdGhpcy5fbWF4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3BlbmRpbmcgKz0gbjtcbiAgICAgICAgICBpZiAodGhpcy5fcGVuZGluZyA+PSB0aGlzLl9tYXgpIHtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmcgPSB0aGlzLl9tYXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24ucmVxdWVzdChuKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fbWF4ID0gbWF4O1xuICAgIHRoaXMuX3BlbmRpbmcgPSAwO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdWJzY3JpYmVyID0gc3Vic2NyaWJlciB8fCB7fTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG4gIG9uQ29tcGxldGUoKSB7XG4gICAgaWYgKCF0aGlzLl9hY3RpdmUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ0Zsb3dhYmxlOiBJbnZhbGlkIGNhbGwgdG8gb25Db21wbGV0ZSgpOiAlcy4nLFxuICAgICAgICB0aGlzLl9zdGFydGVkXG4gICAgICAgICAgPyAnb25Db21wbGV0ZS9vbkVycm9yIHdhcyBhbHJlYWR5IGNhbGxlZCdcbiAgICAgICAgICA6ICdvblN1YnNjcmliZSBoYXMgbm90IGJlZW4gY2FsbGVkJ1xuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fc3RhcnRlZCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLl9zdWJzY3JpYmVyLm9uQ29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlci5vbkNvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmICh0aGlzLl9zdWJzY3JpYmVyLm9uRXJyb3IpIHtcbiAgICAgICAgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgb25FcnJvcihlcnJvcikge1xuICAgIGlmICh0aGlzLl9zdGFydGVkICYmICF0aGlzLl9hY3RpdmUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ0Zsb3dhYmxlOiBJbnZhbGlkIGNhbGwgdG8gb25FcnJvcigpOiAlcy4nLFxuICAgICAgICB0aGlzLl9hY3RpdmVcbiAgICAgICAgICA/ICdvbkNvbXBsZXRlL29uRXJyb3Igd2FzIGFscmVhZHkgY2FsbGVkJ1xuICAgICAgICAgIDogJ29uU3Vic2NyaWJlIGhhcyBub3QgYmVlbiBjYWxsZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zdWJzY3JpYmVyLm9uRXJyb3IgJiYgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgfVxuICBvbk5leHQoZGF0YSkge1xuICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdGbG93YWJsZTogSW52YWxpZCBjYWxsIHRvIG9uTmV4dCgpOiAlcy4nLFxuICAgICAgICB0aGlzLl9hY3RpdmVcbiAgICAgICAgICA/ICdvbkNvbXBsZXRlL29uRXJyb3Igd2FzIGFscmVhZHkgY2FsbGVkJ1xuICAgICAgICAgIDogJ29uU3Vic2NyaWJlIGhhcyBub3QgYmVlbiBjYWxsZWQnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcGVuZGluZyA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnRmxvd2FibGU6IEludmFsaWQgY2FsbCB0byBvbk5leHQoKSwgYWxsIHJlcXVlc3QoKWVkIHZhbHVlcyBoYXZlIGJlZW4gJyArXG4gICAgICAgICAgJ3B1Ymxpc2hlZC4nXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcGVuZGluZyAhPT0gdGhpcy5fbWF4KSB7XG4gICAgICB0aGlzLl9wZW5kaW5nLS07XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVyLm9uTmV4dCAmJiB0aGlzLl9zdWJzY3JpYmVyLm9uTmV4dChkYXRhKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICB9XG4gICAgICB0aGlzLm9uRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuICBvblN1YnNjcmliZShzdWJzY3JpcHRpb24pIHtcbiAgICBpZiAodGhpcy5fc3RhcnRlZCkge1xuICAgICAgY29uc29sZS53YXJuKCdGbG93YWJsZTogSW52YWxpZCBjYWxsIHRvIG9uU3Vic2NyaWJlKCk6IGFscmVhZHkgY2FsbGVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbjtcbiAgICB0cnkge1xuICAgICAgdGhpcy5fc3Vic2NyaWJlci5vblN1YnNjcmliZSAmJlxuICAgICAgICB0aGlzLl9zdWJzY3JpYmVyLm9uU3Vic2NyaWJlKHtcbiAgICAgICAgICBjYW5jZWw6IHRoaXMuX2NhbmNlbCxcbiAgICAgICAgICByZXF1ZXN0OiB0aGlzLl9yZXF1ZXN0LFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5vbkVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7dmFsdWU6IHRydWV9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcblxuLyoqXG4gKiBBbiBvcGVyYXRvciB0aGF0IGFjdHMgbGlrZSBBcnJheS5tYXAsIGFwcGx5aW5nIGEgZ2l2ZW4gZnVuY3Rpb24gdG9cbiAqIGFsbCB2YWx1ZXMgcHJvdmlkZWQgYnkgaXRzIGBTdWJzY3JpcHRpb25gIGFuZCBwYXNzaW5nIHRoZSByZXN1bHQgdG8gaXRzXG4gKiBgU3Vic2NyaWJlcmAuXG4gKi9cbmNsYXNzIEZsb3dhYmxlTWFwT3BlcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVyLCBmbikge1xuICAgIHRoaXMuX2ZuID0gZm47XG4gICAgdGhpcy5fc3Vic2NyaWJlciA9IHN1YnNjcmliZXI7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIG9uQ29tcGxldGUoKSB7XG4gICAgdGhpcy5fc3Vic2NyaWJlci5vbkNvbXBsZXRlKCk7XG4gIH1cblxuICBvbkVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgfVxuXG4gIG9uTmV4dCh0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXIub25OZXh0KHRoaXMuX2ZuKHQpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoIXRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N1YnNjcmlwdGlvbiBpcyBudWxsJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVyLm9uRXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbiAgb25TdWJzY3JpYmUoc3Vic2NyaXB0aW9uKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICAgIHRoaXMuX3N1YnNjcmliZXIub25TdWJzY3JpYmUoc3Vic2NyaXB0aW9uKTtcbiAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRmxvd2FibGVNYXBPcGVyYXRvcjtcbiIsIid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG5jbGFzcyBGbG93YWJsZVByb2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHNvdXJjZSwgZm4pIHtcbiAgICB0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy5fdHJhbnNmb3JtZXIgPSBmbjtcbiAgICB0aGlzLl9kb25lID0gZmFsc2U7XG4gICAgdGhpcy5fbWFwcGVycyA9IFtdOyAvL21hcHBlcnMgZm9yIG1hcCBmdW5jdGlvblxuICB9XG5cbiAgb25TdWJzY3JpYmUoc3Vic2NyaXB0aW9uKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgb25OZXh0KHQpIHtcbiAgICBpZiAoIXRoaXMuX3NpbmspIHtcbiAgICAgIGNvbnNvbGUud2FybigncHJlbWF0dXJlIG9uTmV4dCBmb3IgcHJvY2Vzc29yLCBkcm9wcGluZyB2YWx1ZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB2YWwgPSB0O1xuICAgIGlmICh0aGlzLl90cmFuc2Zvcm1lcikge1xuICAgICAgdmFsID0gdGhpcy5fdHJhbnNmb3JtZXIodCk7XG4gICAgfVxuICAgIGNvbnN0IGZpbmFsVmFsID0gdGhpcy5fbWFwcGVycy5yZWR1Y2UoXG4gICAgICAoaW50ZXJpbVZhbCwgbWFwcGVyKSA9PiBtYXBwZXIoaW50ZXJpbVZhbCksXG4gICAgICB2YWxcbiAgICApO1xuXG4gICAgdGhpcy5fc2luay5vbk5leHQoZmluYWxWYWwpO1xuICB9XG5cbiAgb25FcnJvcihlcnJvcikge1xuICAgIHRoaXMuX2Vycm9yID0gZXJyb3I7XG4gICAgaWYgKCF0aGlzLl9zaW5rKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3ByZW1hdHVyZSBvbkVycm9yIGZvciBwcm9jZXNzb3IsIG1hcmtpbmcgY29tcGxldGUvZXJyb3JlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zaW5rLm9uRXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfVxuXG4gIG9uQ29tcGxldGUoKSB7XG4gICAgdGhpcy5fZG9uZSA9IHRydWU7XG4gICAgaWYgKCF0aGlzLl9zaW5rKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3ByZW1hdHVyZSBvbkVycm9yIGZvciBwcm9jZXNzb3IsIG1hcmtpbmcgY29tcGxldGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2luay5vbkNvbXBsZXRlKCk7XG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlKHN1YnNjcmliZXIpIHtcbiAgICBpZiAodGhpcy5fc291cmNlLnN1YnNjcmliZSkge1xuICAgICAgdGhpcy5fc291cmNlLnN1YnNjcmliZSh0aGlzKTtcbiAgICB9XG4gICAgdGhpcy5fc2luayA9IHN1YnNjcmliZXI7XG4gICAgdGhpcy5fc2luay5vblN1YnNjcmliZSh0aGlzKTtcblxuICAgIGlmICh0aGlzLl9lcnJvcikge1xuICAgICAgdGhpcy5fc2luay5vbkVycm9yKHRoaXMuX2Vycm9yKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2RvbmUpIHtcbiAgICAgIHRoaXMuX3Npbmsub25Db21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIG1hcChmbikge1xuICAgIHRoaXMuX21hcHBlcnMucHVzaChmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXF1ZXN0KG4pIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gJiYgdGhpcy5fc3Vic2NyaXB0aW9uLnJlcXVlc3Qobik7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uICYmIHRoaXMuX3N1YnNjcmlwdGlvbi5jYW5jZWwoKTtcbiAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gRmxvd2FibGVQcm9jZXNzb3I7XG4iLCIvKiogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbi8qKlxuICogQW4gb3BlcmF0b3IgdGhhdCByZXF1ZXN0cyBhIGZpeGVkIG51bWJlciBvZiB2YWx1ZXMgZnJvbSBpdHMgc291cmNlXG4gKiBgU3Vic2NyaXB0aW9uYCBhbmQgZm9yd2FyZHMgdGhlbSB0byBpdHMgYFN1YnNjcmliZXJgLCBjYW5jZWxsaW5nIHRoZVxuICogc3Vic2NyaXB0aW9uIHdoZW4gdGhlIHJlcXVlc3RlZCBudW1iZXIgb2YgaXRlbXMgaGFzIGJlZW4gcmVhY2hlZC5cbiAqL1xuY2xhc3MgRmxvd2FibGVUYWtlT3BlcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihzdWJzY3JpYmVyLCB0b1Rha2UpIHtcbiAgICB0aGlzLl9zdWJzY3JpYmVyID0gc3Vic2NyaWJlcjtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMuX3RvVGFrZSA9IHRvVGFrZTtcbiAgfVxuXG4gIG9uQ29tcGxldGUoKSB7XG4gICAgdGhpcy5fc3Vic2NyaWJlci5vbkNvbXBsZXRlKCk7XG4gIH1cblxuICBvbkVycm9yKGVycm9yKSB7XG4gICAgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgfVxuXG4gIG9uTmV4dCh0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXIub25OZXh0KHQpO1xuICAgICAgaWYgKC0tdGhpcy5fdG9UYWtlID09PSAwKSB7XG4gICAgICAgIHRoaXMuX2NhbmNlbEFuZENvbXBsZXRlKCk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCF0aGlzLl9zdWJzY3JpcHRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdWJzY3JpcHRpb24gaXMgbnVsbCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLmNhbmNlbCgpO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGUpO1xuICAgIH1cbiAgfVxuXG4gIG9uU3Vic2NyaWJlKHN1YnNjcmlwdGlvbikge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbjtcbiAgICB0aGlzLl9zdWJzY3JpYmVyLm9uU3Vic2NyaWJlKHN1YnNjcmlwdGlvbik7XG4gICAgaWYgKHRoaXMuX3RvVGFrZSA8PSAwKSB7XG4gICAgICB0aGlzLl9jYW5jZWxBbmRDb21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIF9jYW5jZWxBbmRDb21wbGV0ZSgpIHtcbiAgICBpZiAoIXRoaXMuX3N1YnNjcmlwdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdWJzY3JpcHRpb24gaXMgbnVsbCcpO1xuICAgIH1cbiAgICB0aGlzLl9zdWJzY3JpcHRpb24uY2FuY2VsKCk7XG4gICAgdGhpcy5fc3Vic2NyaWJlci5vbkNvbXBsZXRlKCk7XG4gIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IEZsb3dhYmxlVGFrZU9wZXJhdG9yO1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5ldmVyeSA9IGV2ZXJ5O1xuXG52YXIgX0Zsb3dhYmxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL0Zsb3dhYmxlJykpO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBQdWJsaXNoZXIgdGhhdCBwcm92aWRlcyB0aGUgY3VycmVudCB0aW1lIChEYXRlLm5vdygpKSBldmVyeSBgbXNgXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogVGhlIHRpbWVyIGlzIGVzdGFibGlzaGVkIG9uIHRoZSBmaXJzdCBjYWxsIHRvIGByZXF1ZXN0YDogb24gZWFjaFxuICogaW50ZXJ2YWwgYSB2YWx1ZSBpcyBwdWJsaXNoZWQgaWYgdGhlcmUgYXJlIG91dHN0YW5kaW5nIHJlcXVlc3RzLFxuICogb3RoZXJ3aXNlIG5vdGhpbmcgb2NjdXJzIGZvciB0aGF0IGludGVydmFsLiBUaGlzIGFwcHJvYWNoIGVuc3VyZXNcbiAqIHRoYXQgdGhlIGludGVydmFsIGJldHdlZW4gYG9uTmV4dGAgY2FsbHMgaXMgYXMgcmVndWxhciBhcyBwb3NzaWJsZVxuICogYW5kIG1lYW5zIHRoYXQgb3ZlcmxhcHBpbmcgYHJlcXVlc3RgIGNhbGxzIChpZSBjYWxsaW5nIGFnYWluIGJlZm9yZVxuICogdGhlIHByZXZpb3VzIHZhbHVlcyBoYXZlIGJlZW4gdmVuZGVkKSBiZWhhdmVzIGNvbnNpc3RlbnRseS5cbiAqL1xuZnVuY3Rpb24gZXZlcnkobXMpIHtcbiAgcmV0dXJuIG5ldyBfRmxvd2FibGUuZGVmYXVsdCgoc3Vic2NyaWJlcikgPT4ge1xuICAgIGxldCBpbnRlcnZhbElkID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgc3Vic2NyaWJlci5vblN1YnNjcmliZSh7XG4gICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgaWYgKGludGVydmFsSWQgIT0gbnVsbCkge1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgaW50ZXJ2YWxJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZXF1ZXN0OiAobikgPT4ge1xuICAgICAgICBpZiAobiA8IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB7XG4gICAgICAgICAgcGVuZGluZyArPSBuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlbmRpbmcgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW50ZXJ2YWxJZCAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgaWYgKHBlbmRpbmcgPiAwKSB7XG4gICAgICAgICAgICBpZiAocGVuZGluZyAhPT0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICAgICAgICAgICAgcGVuZGluZy0tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaWJlci5vbk5leHQoRGF0ZS5ub3coKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBtcyk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn1cbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKlxuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50cyB0byBwcm92aWRlXG4gKiBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudCB3aWxsXG4gKiByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5mdW5jdGlvbiBpbnZhcmlhbnQoY29uZGl0aW9uLCBmb3JtYXQsIC4uLmFyZ3MpIHtcbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICBsZXQgZXJyb3I7XG5cbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCAnICtcbiAgICAgICAgICAnZGV2IGVudmlyb25tZW50IGZvciB0aGUgZnVsbCBlcnJvciBtZXNzYWdlIGFuZCBhZGRpdGlvbmFsIGhlbHBmdWwgd2FybmluZ3MuJ1xuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKGZvcm1hdC5yZXBsYWNlKC8lcy9nLCAoKSA9PiBTdHJpbmcoYXJnc1thcmdJbmRleCsrXSkpKTtcbiAgICAgIGVycm9yLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyBTa2lwIGludmFyaWFudCdzIG93biBzdGFjayBmcmFtZS5cblxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBsYXp5IGNvbXB1dGF0aW9uIHRoYXQgd2lsbCBlaXRoZXIgcHJvZHVjZSBhIHZhbHVlIG9mIHR5cGUgVFxuICogb3IgZmFpbCB3aXRoIGFuIGVycm9yLiBDYWxsaW5nIGBzdWJzY3JpYmUoKWAgc3RhcnRzIHRoZVxuICogY29tcHV0YXRpb24gYW5kIHJldHVybnMgYSBzdWJzY3JpcHRpb24gb2JqZWN0LCB3aGljaCBoYXMgYW4gYHVuc3Vic2NyaWJlKClgXG4gKiBtZXRob2QgdGhhdCBjYW4gYmUgY2FsbGVkIHRvIHByZXZlbnQgY29tcGxldGlvbi9lcnJvciBjYWxsYmFja3MgZnJvbSBiZWluZ1xuICogaW52b2tlZCBhbmQsIHdoZXJlIHN1cHBvcnRlZCwgdG8gYWxzbyBjYW5jZWwgdGhlIGNvbXB1dGF0aW9uLlxuICogSW1wbGVtZW50YXRpb25zIG1heSBvcHRpb25hbGx5IGltcGxlbWVudCBjYW5jZWxsYXRpb247IGlmIHRoZXkgZG8gbm90XG4gKiBgY2FuY2VsKClgIGlzIGEgbm8tb3AuXG4gKlxuICogTm90ZTogVW5saWtlIFByb21pc2UsIGNhbGxiYWNrcyAob25Db21wbGV0ZS9vbkVycm9yKSBtYXkgYmUgaW52b2tlZFxuICogc3luY2hyb25vdXNseS5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYFxuICogY29uc3QgdmFsdWUgPSBuZXcgU2luZ2xlKHN1YnNjcmliZXIgPT4ge1xuICogICBjb25zdCBpZCA9IHNldFRpbWVvdXQoXG4gKiAgICAgKCkgPT4gc3Vic2NyaWJlci5vbkNvbXBsZXRlKCdIZWxsbyEnKSxcbiAqICAgICAyNTBcbiAqICAgKTtcbiAqICAgLy8gT3B0aW9uYWw6IENhbGwgYG9uU3Vic2NyaWJlYCB3aXRoIGEgY2FuY2VsbGF0aW9uIGNhbGxiYWNrXG4gKiAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoKCkgPT4gY2xlYXJUaW1lb3V0KGlkKSk7XG4gKiB9KTtcbiAqXG4gKiAvLyBTdGFydCB0aGUgY29tcHV0YXRpb24uIG9uQ29tcGxldGUgd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgdGhlIHRpbWVvdXRcbiAqIC8vIHdpdGggJ2hlbGxvJyAgdW5sZXNzIGBjYW5jZWwoKWAgaXMgY2FsbGVkIGZpcnN0LlxuICogdmFsdWUuc3Vic2NyaWJlKHtcbiAqICAgb25Db21wbGV0ZTogdmFsdWUgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogICBvbkVycm9yOiBlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSxcbiAqICAgb25TdWJzY3JpYmU6IGNhbmNlbCA9PiAuLi5cbiAqIH0pO1xuICogYGBgXG4gKi9cbmNsYXNzIFNpbmdsZSB7XG4gIHN0YXRpYyBvZih2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgU2luZ2xlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBzdWJzY3JpYmVyLm9uU3Vic2NyaWJlKCk7XG4gICAgICBzdWJzY3JpYmVyLm9uQ29tcGxldGUodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIGVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIG5ldyBTaW5nbGUoKHN1YnNjcmliZXIpID0+IHtcbiAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoKTtcbiAgICAgIHN1YnNjcmliZXIub25FcnJvcihlcnJvcik7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgbmV2ZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBTaW5nbGUoKHN1YnNjcmliZXIpID0+IHtcbiAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xuICAgIHRoaXMuX3NvdXJjZSA9IHNvdXJjZTtcbiAgfVxuXG4gIHN1YnNjcmliZShwYXJ0aWFsU3Vic2NyaWJlcikge1xuICAgIGNvbnN0IHN1YnNjcmliZXIgPSBuZXcgRnV0dXJlU3Vic2NyaWJlcihwYXJ0aWFsU3Vic2NyaWJlcik7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX3NvdXJjZShzdWJzY3JpYmVyKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgICB9XG4gIH1cblxuICBmbGF0TWFwKGZuKSB7XG4gICAgcmV0dXJuIG5ldyBTaW5nbGUoKHN1YnNjcmliZXIpID0+IHtcbiAgICAgIGxldCBjdXJyZW50Q2FuY2VsO1xuICAgICAgY29uc3QgY2FuY2VsID0gKCkgPT4ge1xuICAgICAgICBjdXJyZW50Q2FuY2VsICYmIGN1cnJlbnRDYW5jZWwoKTtcbiAgICAgICAgY3VycmVudENhbmNlbCA9IG51bGw7XG4gICAgICB9O1xuICAgICAgdGhpcy5fc291cmNlKHtcbiAgICAgICAgb25Db21wbGV0ZTogKHZhbHVlKSA9PiB7XG4gICAgICAgICAgZm4odmFsdWUpLnN1YnNjcmliZSh7XG4gICAgICAgICAgICBvbkNvbXBsZXRlOiAobWFwVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgc3Vic2NyaWJlci5vbkNvbXBsZXRlKG1hcFZhbHVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHN1YnNjcmliZXIub25FcnJvcihlcnJvciksXG4gICAgICAgICAgICBvblN1YnNjcmliZTogKF9jYW5jZWwpID0+IHtcbiAgICAgICAgICAgICAgY3VycmVudENhbmNlbCA9IF9jYW5jZWw7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBvbkVycm9yOiAoZXJyb3IpID0+IHN1YnNjcmliZXIub25FcnJvcihlcnJvciksXG4gICAgICAgIG9uU3Vic2NyaWJlOiAoX2NhbmNlbCkgPT4ge1xuICAgICAgICAgIGN1cnJlbnRDYW5jZWwgPSBfY2FuY2VsO1xuICAgICAgICAgIHN1YnNjcmliZXIub25TdWJzY3JpYmUoY2FuY2VsKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIG5ldyBTaW5nbGUgdGhhdCByZXNvbHZlcyB0byB0aGUgdmFsdWUgb2YgdGhpcyBTaW5nbGUgYXBwbGllZCB0b1xuICAgKiB0aGUgZ2l2ZW4gbWFwcGluZyBmdW5jdGlvbi5cbiAgICovXG4gIG1hcChmbikge1xuICAgIHJldHVybiBuZXcgU2luZ2xlKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5fc291cmNlKHtcbiAgICAgICAgb25Db21wbGV0ZTogKHZhbHVlKSA9PiBzdWJzY3JpYmVyLm9uQ29tcGxldGUoZm4odmFsdWUpKSxcbiAgICAgICAgb25FcnJvcjogKGVycm9yKSA9PiBzdWJzY3JpYmVyLm9uRXJyb3IoZXJyb3IpLFxuICAgICAgICBvblN1YnNjcmliZTogKGNhbmNlbCkgPT4gc3Vic2NyaWJlci5vblN1YnNjcmliZShjYW5jZWwpLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICB0aGVuKHN1Y2Nlc3NGbiwgZXJyb3JGbikge1xuICAgIHRoaXMuc3Vic2NyaWJlKHtcbiAgICAgIG9uQ29tcGxldGU6IHN1Y2Nlc3NGbiB8fCAoKCkgPT4ge30pLFxuICAgICAgb25FcnJvcjogZXJyb3JGbiB8fCAoKCkgPT4ge30pLFxuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogQHByaXZhdGVcbiAqLyBleHBvcnRzLmRlZmF1bHQgPSBTaW5nbGU7XG5jbGFzcyBGdXR1cmVTdWJzY3JpYmVyIHtcbiAgY29uc3RydWN0b3Ioc3Vic2NyaWJlcikge1xuICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdWJzY3JpYmVyID0gc3Vic2NyaWJlciB8fCB7fTtcbiAgfVxuXG4gIG9uQ29tcGxldGUodmFsdWUpIHtcbiAgICBpZiAoIXRoaXMuX2FjdGl2ZSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnU2luZ2xlOiBJbnZhbGlkIGNhbGwgdG8gb25Db21wbGV0ZSgpOiAlcy4nLFxuICAgICAgICB0aGlzLl9zdGFydGVkXG4gICAgICAgICAgPyAnb25Db21wbGV0ZS9vbkVycm9yIHdhcyBhbHJlYWR5IGNhbGxlZCdcbiAgICAgICAgICA6ICdvblN1YnNjcmliZSBoYXMgbm90IGJlZW4gY2FsbGVkJ1xuICAgICAgKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgaWYgKHRoaXMuX3N1YnNjcmliZXIub25Db21wbGV0ZSkge1xuICAgICAgICB0aGlzLl9zdWJzY3JpYmVyLm9uQ29tcGxldGUodmFsdWUpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAodGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKSB7XG4gICAgICAgIHRoaXMuX3N1YnNjcmliZXIub25FcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25FcnJvcihlcnJvcikge1xuICAgIGlmICh0aGlzLl9zdGFydGVkICYmICF0aGlzLl9hY3RpdmUpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1NpbmdsZTogSW52YWxpZCBjYWxsIHRvIG9uRXJyb3IoKTogJXMuJyxcbiAgICAgICAgdGhpcy5fYWN0aXZlXG4gICAgICAgICAgPyAnb25Db21wbGV0ZS9vbkVycm9yIHdhcyBhbHJlYWR5IGNhbGxlZCdcbiAgICAgICAgICA6ICdvblN1YnNjcmliZSBoYXMgbm90IGJlZW4gY2FsbGVkJ1xuICAgICAgKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zdWJzY3JpYmVyLm9uRXJyb3IgJiYgdGhpcy5fc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgfVxuXG4gIG9uU3Vic2NyaWJlKGNhbmNlbCkge1xuICAgIGlmICh0aGlzLl9zdGFydGVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1NpbmdsZTogSW52YWxpZCBjYWxsIHRvIG9uU3Vic2NyaWJlKCk6IGFscmVhZHkgY2FsbGVkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSB0cnVlO1xuICAgIHRoaXMuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVyLm9uU3Vic2NyaWJlICYmXG4gICAgICAgIHRoaXMuX3N1YnNjcmliZXIub25TdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy5fYWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgIGNhbmNlbCAmJiBjYW5jZWwoKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMub25FcnJvcihlcnJvcik7XG4gICAgfVxuICB9XG59XG4iLCIvKiogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0Zsb3dhYmxlJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0Zsb3dhYmxlLmRlZmF1bHQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnU2luZ2xlJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX1NpbmdsZS5kZWZhdWx0O1xuICB9LFxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ0Zsb3dhYmxlUHJvY2Vzc29yJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gX0Zsb3dhYmxlUHJvY2Vzc29yLmRlZmF1bHQ7XG4gIH0sXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnZXZlcnknLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfRmxvd2FibGVUaW1lci5ldmVyeTtcbiAgfSxcbn0pO1xuXG52YXIgX0Zsb3dhYmxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL0Zsb3dhYmxlJykpO1xudmFyIF9TaW5nbGUgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoJy4vU2luZ2xlJykpO1xudmFyIF9GbG93YWJsZVByb2Nlc3NvciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9GbG93YWJsZVByb2Nlc3NvcicpKTtcbnZhciBfRmxvd2FibGVUaW1lciA9IHJlcXVpcmUoJy4vRmxvd2FibGVUaW1lcicpO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5leHBvcnRzLkNPTk5FQ1RJT05fU1RBVFVTID0gdm9pZCAwO1xuLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbi8qKlxuICogQSBjb250cmFjdCBwcm92aWRpbmcgZGlmZmVyZW50IGludGVyYWN0aW9uIG1vZGVscyBwZXIgdGhlIFtSZWFjdGl2ZVNvY2tldCBwcm90b2NvbF1cbiAoaHR0cHM6Ly9naXRodWIuY29tL1JlYWN0aXZlU29ja2V0L3JlYWN0aXZlc29ja2V0L2Jsb2IvbWFzdGVyL1Byb3RvY29sLm1kKS5cbiAqL1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBuZXR3b3JrIGNvbm5lY3Rpb24gd2l0aCBpbnB1dC9vdXRwdXQgdXNlZCBieSBhIFJlYWN0aXZlU29ja2V0IHRvXG4gKiBzZW5kL3JlY2VpdmUgZGF0YS5cbiAqL1xuXG4vKipcbiAqIERlc2NyaWJlcyB0aGUgY29ubmVjdGlvbiBzdGF0dXMgb2YgYSBSZWFjdGl2ZVNvY2tldC9EdXBsZXhDb25uZWN0aW9uLlxuICogLSBOT1RfQ09OTkVDVEVEOiBubyBjb25uZWN0aW9uIGVzdGFibGlzaGVkIG9yIHBlbmRpbmcuXG4gKiAtIENPTk5FQ1RJTkc6IHdoZW4gYGNvbm5lY3QoKWAgaGFzIGJlZW4gY2FsbGVkIGJ1dCBhIGNvbm5lY3Rpb24gaXMgbm90IHlldFxuICogICBlc3RhYmxpc2hlZC5cbiAqIC0gQ09OTkVDVEVEOiB3aGVuIGEgY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZC5cbiAqIC0gQ0xPU0VEOiB3aGVuIHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIGV4cGxpY2l0bHkgY2xvc2VkIHZpYSBgY2xvc2UoKWAuXG4gKiAtIEVSUk9SOiB3aGVuIHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIGNsb3NlZCBmb3IgYW55IG90aGVyIHJlYXNvbi5cbiAqL1xuXG5jb25zdCBDT05ORUNUSU9OX1NUQVRVUyA9IHtcbiAgQ0xPU0VEOiBPYmplY3QuZnJlZXplKHtraW5kOiAnQ0xPU0VEJ30pLFxuICBDT05ORUNURUQ6IE9iamVjdC5mcmVlemUoe2tpbmQ6ICdDT05ORUNURUQnfSksXG4gIENPTk5FQ1RJTkc6IE9iamVjdC5mcmVlemUoe2tpbmQ6ICdDT05ORUNUSU5HJ30pLFxuICBOT1RfQ09OTkVDVEVEOiBPYmplY3QuZnJlZXplKHtraW5kOiAnTk9UX0NPTk5FQ1RFRCd9KSxcbn07XG5cbi8qKlxuICogQSB0eXBlIHRoYXQgY2FuIGJlIHdyaXR0ZW4gdG8gYSBidWZmZXIuXG4gKi8gZXhwb3J0cy5DT05ORUNUSU9OX1NUQVRVUyA9IENPTk5FQ1RJT05fU1RBVFVTO1xuIiwiJ3VzZSBzdHJpY3QnO1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuXG52YXIgX1JlYWN0aXZlU29ja2V0VHlwZXMgPSByZXF1aXJlKCcuL1JlYWN0aXZlU29ja2V0VHlwZXMnKTtcbk9iamVjdC5rZXlzKF9SZWFjdGl2ZVNvY2tldFR5cGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gJ2RlZmF1bHQnIHx8IGtleSA9PT0gJ19fZXNNb2R1bGUnKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9SZWFjdGl2ZVNvY2tldFR5cGVzW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX1JlYWN0aXZlU29ja2V0VHlwZXNba2V5XTtcbiAgICB9LFxuICB9KTtcbn0pO1xuXG52YXIgX1JlYWN0aXZlU3RyZWFtVHlwZXMgPSByZXF1aXJlKCcuL1JlYWN0aXZlU3RyZWFtVHlwZXMnKTtcbk9iamVjdC5rZXlzKF9SZWFjdGl2ZVN0cmVhbVR5cGVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gJ2RlZmF1bHQnIHx8IGtleSA9PT0gJ19fZXNNb2R1bGUnKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9SZWFjdGl2ZVN0cmVhbVR5cGVzW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX1JlYWN0aXZlU3RyZWFtVHlwZXNba2V5XTtcbiAgICB9LFxuICB9KTtcbn0pO1xuIiwiLyoqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqXG4gKlxuICovXG5cbid1c2Ugc3RyaWN0Jztcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHt2YWx1ZTogdHJ1ZX0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX3Jzb2NrZXRGbG93YWJsZSA9IHJlcXVpcmUoJ3Jzb2NrZXQtZmxvd2FibGUnKTtcbnZhciBfcnNvY2tldENvcmUgPSByZXF1aXJlKCdyc29ja2V0LWNvcmUnKTtcblxudmFyIF9yc29ja2V0VHlwZXMgPSByZXF1aXJlKCdyc29ja2V0LXR5cGVzJyk7XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEEgV2ViU29ja2V0IHRyYW5zcG9ydCBjbGllbnQgZm9yIHVzZSBpbiBicm93c2VyIGVudmlyb25tZW50cy5cbiAqL1xuY2xhc3MgUlNvY2tldFdlYlNvY2tldENsaWVudCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMsIGVuY29kZXJzKSB7XG4gICAgX2RlZmluZVByb3BlcnR5KFxuICAgICAgdGhpcyxcbiAgICAgICdfaGFuZGxlQ2xvc2VkJyxcblxuICAgICAgKGUpID0+IHtcbiAgICAgICAgdGhpcy5fY2xvc2UoXG4gICAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgICAgZS5yZWFzb24gfHwgJ1JTb2NrZXRXZWJTb2NrZXRDbGllbnQ6IFNvY2tldCBjbG9zZWQgdW5leHBlY3RlZGx5LidcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoXG4gICAgICB0aGlzLFxuICAgICAgJ19oYW5kbGVFcnJvcicsXG5cbiAgICAgIChlKSA9PiB7XG4gICAgICAgIHRoaXMuX2Nsb3NlKGUuZXJyb3IpO1xuICAgICAgfVxuICAgICk7XG4gICAgX2RlZmluZVByb3BlcnR5KFxuICAgICAgdGhpcyxcbiAgICAgICdfaGFuZGxlT3BlbmVkJyxcblxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLl9zZXRDb25uZWN0aW9uU3RhdHVzKF9yc29ja2V0VHlwZXMuQ09OTkVDVElPTl9TVEFUVVMuQ09OTkVDVEVEKTtcbiAgICAgIH1cbiAgICApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShcbiAgICAgIHRoaXMsXG4gICAgICAnX2hhbmRsZU1lc3NhZ2UnLFxuXG4gICAgICAobWVzc2FnZSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gdGhpcy5fcmVhZEZyYW1lKG1lc3NhZ2UpO1xuICAgICAgICAgIHRoaXMuX3JlY2VpdmVycy5mb3JFYWNoKChzdWJzY3JpYmVyKSA9PiBzdWJzY3JpYmVyLm9uTmV4dChmcmFtZSkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIHRoaXMuX2Nsb3NlKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgdGhpcy5fZW5jb2RlcnMgPSBlbmNvZGVycztcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl9yZWNlaXZlcnMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fc2VuZGVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuX3N0YXR1cyA9IF9yc29ja2V0VHlwZXMuQ09OTkVDVElPTl9TVEFUVVMuTk9UX0NPTk5FQ1RFRDtcbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpYmVycyA9IG5ldyBTZXQoKTtcbiAgfVxuICBjbG9zZSgpIHtcbiAgICB0aGlzLl9jbG9zZSgpO1xuICB9XG4gIGNvbm5lY3QoKSB7XG4gICAgaWYgKHRoaXMuX3N0YXR1cy5raW5kICE9PSAnTk9UX0NPTk5FQ1RFRCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1JTb2NrZXRXZWJTb2NrZXRDbGllbnQ6IENhbm5vdCBjb25uZWN0KCksIGEgY29ubmVjdGlvbiBpcyBhbHJlYWR5ICcgK1xuICAgICAgICAgICdlc3RhYmxpc2hlZC4nXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLl9zZXRDb25uZWN0aW9uU3RhdHVzKF9yc29ja2V0VHlwZXMuQ09OTkVDVElPTl9TVEFUVVMuQ09OTkVDVElORyk7XG4gICAgY29uc3Qgd3NDcmVhdG9yID0gdGhpcy5fb3B0aW9ucy53c0NyZWF0b3I7XG4gICAgY29uc3QgdXJsID0gdGhpcy5fb3B0aW9ucy51cmw7XG4gICAgdGhpcy5fc29ja2V0ID0gd3NDcmVhdG9yID8gd3NDcmVhdG9yKHVybCkgOiBuZXcgV2ViU29ja2V0KHVybCk7XG4gICAgY29uc3Qgc29ja2V0ID0gdGhpcy5fc29ja2V0O1xuICAgIHNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCB0aGlzLl9oYW5kbGVDbG9zZWQpO1xuICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2hhbmRsZUVycm9yKTtcbiAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIHRoaXMuX2hhbmRsZU9wZW5lZCk7XG4gICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLl9oYW5kbGVNZXNzYWdlKTtcbiAgfVxuICBjb25uZWN0aW9uU3RhdHVzKCkge1xuICAgIHJldHVybiBuZXcgX3Jzb2NrZXRGbG93YWJsZS5GbG93YWJsZSgoc3Vic2NyaWJlcikgPT4ge1xuICAgICAgc3Vic2NyaWJlci5vblN1YnNjcmliZSh7XG4gICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWVzdDogKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3N0YXR1c1N1YnNjcmliZXJzLmFkZChzdWJzY3JpYmVyKTtcbiAgICAgICAgICBzdWJzY3JpYmVyLm9uTmV4dCh0aGlzLl9zdGF0dXMpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmVjZWl2ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9yc29ja2V0Rmxvd2FibGUuRmxvd2FibGUoKHN1YmplY3QpID0+IHtcbiAgICAgIHN1YmplY3Qub25TdWJzY3JpYmUoe1xuICAgICAgICBjYW5jZWw6ICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9yZWNlaXZlcnMuZGVsZXRlKHN1YmplY3QpO1xuICAgICAgICB9LFxuICAgICAgICByZXF1ZXN0OiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fcmVjZWl2ZXJzLmFkZChzdWJqZWN0KTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHNlbmRPbmUoZnJhbWUpIHtcbiAgICB0aGlzLl93cml0ZUZyYW1lKGZyYW1lKTtcbiAgfVxuICBzZW5kKGZyYW1lcykge1xuICAgIGxldCBzdWJzY3JpcHRpb247XG4gICAgZnJhbWVzLnN1YnNjcmliZSh7XG4gICAgICBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgIHN1YnNjcmlwdGlvbiAmJiB0aGlzLl9zZW5kZXJzLmRlbGV0ZShzdWJzY3JpcHRpb24pO1xuICAgICAgfSxcbiAgICAgIG9uRXJyb3I6IChlcnJvcikgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24gJiYgdGhpcy5fc2VuZGVycy5kZWxldGUoc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fY2xvc2UoZXJyb3IpO1xuICAgICAgfSxcbiAgICAgIG9uTmV4dDogKGZyYW1lKSA9PiB0aGlzLl93cml0ZUZyYW1lKGZyYW1lKSxcbiAgICAgIG9uU3Vic2NyaWJlOiAoX3N1YnNjcmlwdGlvbikgPT4ge1xuICAgICAgICBzdWJzY3JpcHRpb24gPSBfc3Vic2NyaXB0aW9uO1xuICAgICAgICB0aGlzLl9zZW5kZXJzLmFkZChzdWJzY3JpcHRpb24pO1xuICAgICAgICBzdWJzY3JpcHRpb24ucmVxdWVzdChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUik7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG4gIF9jbG9zZShlcnJvcikge1xuICAgIGlmICh0aGlzLl9zdGF0dXMua2luZCA9PT0gJ0NMT1NFRCcgfHwgdGhpcy5fc3RhdHVzLmtpbmQgPT09ICdFUlJPUicpIHtcbiAgICAgIC8vIGFscmVhZHkgY2xvc2VkXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YXR1cyA9IGVycm9yXG4gICAgICA/IHtlcnJvciwga2luZDogJ0VSUk9SJ31cbiAgICAgIDogX3Jzb2NrZXRUeXBlcy5DT05ORUNUSU9OX1NUQVRVUy5DTE9TRUQ7XG4gICAgdGhpcy5fc2V0Q29ubmVjdGlvblN0YXR1cyhzdGF0dXMpO1xuICAgIHRoaXMuX3JlY2VpdmVycy5mb3JFYWNoKChzdWJzY3JpYmVyKSA9PiB7XG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgc3Vic2NyaWJlci5vbkVycm9yKGVycm9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN1YnNjcmliZXIub25Db21wbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3JlY2VpdmVycy5jbGVhcigpO1xuICAgIHRoaXMuX3NlbmRlcnMuZm9yRWFjaCgoc3Vic2NyaXB0aW9uKSA9PiBzdWJzY3JpcHRpb24uY2FuY2VsKCkpO1xuICAgIHRoaXMuX3NlbmRlcnMuY2xlYXIoKTtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCkge1xuICAgICAgc29ja2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgdGhpcy5faGFuZGxlQ2xvc2VkKTtcbiAgICAgIHNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHRoaXMuX2hhbmRsZUVycm9yKTtcbiAgICAgIHNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdvcGVuJywgdGhpcy5faGFuZGxlT3BlbmVkKTtcbiAgICAgIHNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy5faGFuZGxlTWVzc2FnZSk7XG4gICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgfVxuICB9XG4gIF9zZXRDb25uZWN0aW9uU3RhdHVzKHN0YXR1cykge1xuICAgIHRoaXMuX3N0YXR1cyA9IHN0YXR1cztcbiAgICB0aGlzLl9zdGF0dXNTdWJzY3JpYmVycy5mb3JFYWNoKChzdWJzY3JpYmVyKSA9PiBzdWJzY3JpYmVyLm9uTmV4dChzdGF0dXMpKTtcbiAgfVxuICBfcmVhZEZyYW1lKG1lc3NhZ2UpIHtcbiAgICBjb25zdCBidWZmZXIgPSAoMCwgX3Jzb2NrZXRDb3JlLnRvQnVmZmVyKShtZXNzYWdlLmRhdGEpO1xuICAgIGNvbnN0IGZyYW1lID0gdGhpcy5fb3B0aW9ucy5sZW5ndGhQcmVmaXhlZEZyYW1lc1xuICAgICAgPyAoMCwgX3Jzb2NrZXRDb3JlLmRlc2VyaWFsaXplRnJhbWVXaXRoTGVuZ3RoKShidWZmZXIsIHRoaXMuX2VuY29kZXJzKVxuICAgICAgOiAoMCwgX3Jzb2NrZXRDb3JlLmRlc2VyaWFsaXplRnJhbWUpKGJ1ZmZlciwgdGhpcy5fZW5jb2RlcnMpO1xuICAgIGlmIChmYWxzZSkge1xuICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgY29uc29sZS5sb2coKDAsIF9yc29ja2V0Q29yZS5wcmludEZyYW1lKShmcmFtZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZnJhbWU7XG4gIH1cblxuICBfd3JpdGVGcmFtZShmcmFtZSkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgaWYgKHRoaXMuX29wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygoMCwgX3Jzb2NrZXRDb3JlLnByaW50RnJhbWUpKGZyYW1lKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX29wdGlvbnMubGVuZ3RoUHJlZml4ZWRGcmFtZXNcbiAgICAgICAgPyAoMCwgX3Jzb2NrZXRDb3JlLnNlcmlhbGl6ZUZyYW1lV2l0aExlbmd0aCkoZnJhbWUsIHRoaXMuX2VuY29kZXJzKVxuICAgICAgICA6ICgwLCBfcnNvY2tldENvcmUuc2VyaWFsaXplRnJhbWUpKGZyYW1lLCB0aGlzLl9lbmNvZGVycyk7XG4gICAgICBpZiAoIXRoaXMuX3NvY2tldCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1JTb2NrZXRXZWJTb2NrZXRDbGllbnQ6IENhbm5vdCBzZW5kIGZyYW1lLCBub3QgY29ubmVjdGVkLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NvY2tldC5zZW5kKGJ1ZmZlcik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHRoaXMuX2Nsb3NlKGVycm9yKTtcbiAgICB9XG4gIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFJTb2NrZXRXZWJTb2NrZXRDbGllbnQ7XG4iLCIvKiogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge3ZhbHVlOiB0cnVlfSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBfUlNvY2tldFdlYlNvY2tldENsaWVudCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoXG4gIHJlcXVpcmUoJy4vUlNvY2tldFdlYlNvY2tldENsaWVudCcpXG4pO1xuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxudmFyIF9kZWZhdWx0ID0gX1JTb2NrZXRXZWJTb2NrZXRDbGllbnQuZGVmYXVsdDtcbmV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xuIiwiZXhwb3J0IGNsYXNzIFVzZXJEZXRhaWxzIHtcclxuICAgIGlkIDogbnVtYmVyO1xyXG4gICAgbmFtZSA6IHN0cmluZztcclxuICAgIHBhc3N3b3JkIDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlkIDogbnVtYmVyLCBuYW1lOiBzdHJpbmcscGFzc3dvcmQgOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmlkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLnBhc3N3b3JkID0gcGFzc3dvcmQ7XHJcbiAgICB9XHJcbiAgICB0b1N0cmluZygpOnN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGBVc2VyIGlkOiAke3RoaXMuaWR9IG5hbWU6ICR7dGhpcy5uYW1lfSBwYXNzd29yZDogJHt0aGlzLnBhc3N3b3JkfWBcclxuICAgIH1cclxufSIsImltcG9ydCBcIkB0cml2aWFsLXB1cnN1aXQtY2xpZW50L2FwaVwiXHJcbmV4cG9ydCAqIGZyb20gJy4vd2Vic29ja2V0LXNlcnZlcic7XHJcbi8vIGNvbnNvbGUubG9nKFwiU2FsdXQgZGUgbGEgcGFydCBkZSBXZWJzb2NrZXQgIVwiKTtcclxuXHJcbmltcG9ydCB7IGluaXQgfSBmcm9tIFwiLi9yc29ja2V0LWNsaWVudFwiO1xyXG5cclxuY29uc29sZS5sb2coXCJTdGFydFwiKTtcclxuY29uc3QgdXJsID0gJ3dzOi8vbG9jYWxob3N0OjY1NjUvcnNvY2tldCc7XHJcbmluaXQodXJsKTsiLCJpbXBvcnQgeyBVc2VyRGV0YWlscyB9IGZyb20gJy4vZGF0YSc7XHJcbmltcG9ydCB7IFNlcnZlclByb3h5IH0gZnJvbSAnLi9zZXJ2ZXItcHJveHknO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgaW50ZXJhY3RzIHdpdGggYW4gSFRNTCBwYWdlIGNvbnRhaW5pbmcgYW4gaW5wdXQgZmllbGQgb2YgaWQgJ3VzZXItaWQnIGFuZFxyXG4gKiBhIGxpc3Qgb2YgZWxlbWVudHMgb2YgaWQgJ3Jlc3VsdCdcclxuICovXHJcbmV4cG9ydCBjbGFzcyBNZWRpYXRvciB7XHJcbiAgICBzdGF0aWMgZmllbGRJZDogc3RyaW5nID0gJ3VzZXItaWQnO1xyXG4gICAgc3RhdGljIGxpc3RJZDogc3RyaW5nID0gJ3Jlc3VsdCc7XHJcblxyXG4gICAgcHJpdmF0ZSBpbnB1dEVsZW1lbnQ/OiBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBfc2VydmVyOiBTZXJ2ZXJQcm94eTtcclxuICAgIHByaXZhdGUgb3V0cHV0TGlzdD86IEhUTUxVTGlzdEVsZW1lbnQ7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2VydmVyOiBTZXJ2ZXJQcm94eSkge1xyXG4gICAgICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHNlcnZlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VydmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBpbml0KCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiTWVkaWF0b3I6OmluaXQoKVwiKTtcclxuICAgICAgICB0aGlzLmlucHV0RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKE1lZGlhdG9yLmZpZWxkSWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGV2dDogRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGFuZ2VkKGV2dCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vdXRwdXRMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoTWVkaWF0b3IubGlzdElkKSBhcyBIVE1MVUxpc3RFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhZGRSZXN1bHQodmFsdWUgOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgaXRlbSA9ICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICAgIGl0ZW0uaW5uZXJIVE1MID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5vdXRwdXRMaXN0IS5hcHBlbmRDaGlsZChpdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqICBNZXRob2QgY2FsbGVkIHdoZW4gdGhlIGlucHV0IGZpZWxkICgndXNlci1pZCcpIGlzIG1vZGlmaWVkXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY2hhbmdlZCh0aGlzIDogTWVkaWF0b3IsIGV2ZW50IDogRXZlbnQpOiB2b2lkIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImZpZWxkQ2hhbmdlZCgpIGNhbGxlZFwiKTtcclxuICAgICAgICBsZXQgZWxlbWVudDogSFRNTElucHV0RWxlbWVudCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgIGxldCBpZDogbnVtYmVyID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5fc2VydmVyLmZpbmRVc2VyQnlJZChpZClcclxuICAgICAgICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiAocGF5bG9hZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ09NUExFVEVEXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBwYXlsb2FkLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YS52YWx1ZU9mKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB1c2VyID0gbmV3IFVzZXJEZXRhaWxzKGRhdGEuaWQsIGRhdGEubmFtZSwgZGF0YS5wYXNzd29yZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRSZXN1bHQodXNlci50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uRXJyb3I6IChlcnIpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SID0+IFwiICsgZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIFNUQUNLOiBcIiArIGVyci5zdGFjayk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb25TdWJzY3JpYmU6IChzdWJzY3JpcHRpb24pID0+IHtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgUlNvY2tldENsaWVudCB9IGZyb20gJ3Jzb2NrZXQtY29yZSc7XHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJy4vcnNvY2tldC1jb25uZWN0aW9uJztcclxuaW1wb3J0IHsgTWVkaWF0b3IgfSBmcm9tICcuL21lZGlhdG9yJztcclxuaW1wb3J0IHsgU2VydmVyUHJveHkgfSBmcm9tICcuL3NlcnZlci1wcm94eSc7XHJcblxyXG4vKipcclxuICogQ29ubmVjdHMgdGhlIFJTb2NrZXRDbGllbnQgdG8gc2VydmVyLlxyXG4gKlxyXG4gKiBAcGFyYW0gdXJsXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaW5pdCh1cmw6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgbGV0IGNsaWVudDogUlNvY2tldENsaWVudDxhbnksIGFueT4gPSBjcmVhdGVDbGllbnQodXJsKTtcclxuICAgIGNsaWVudC5jb25uZWN0KCkuc3Vic2NyaWJlKHtcclxuICAgICAgICBvbkNvbXBsZXRlOiBzb2NrZXQgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uQ29tcGxldGVcIik7XHJcbiAgICAgICAgICAgIGxldCBtZWRpYXRvciA9IG5ldyBNZWRpYXRvcihuZXcgU2VydmVyUHJveHkoc29ja2V0KSk7XHJcbiAgICAgICAgICAgIG1lZGlhdG9yLmluaXQoKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uRXJyb3I6IGVycm9yID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJvbkVycm9yXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uU3Vic2NyaWJlOiAoY2FuY2VsKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib25TdWJzY3JpYmVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn0iLCJpbXBvcnQgeyBSU29ja2V0Q2xpZW50LCBDbGllbnRDb25maWcsIEpzb25TZXJpYWxpemVyLCBJZGVudGl0eVNlcmlhbGl6ZXIgfSBmcm9tIFwicnNvY2tldC1jb3JlXCI7XHJcbmltcG9ydCBSU29ja2V0V2ViU29ja2V0Q2xpZW50IGZyb20gXCJyc29ja2V0LXdlYnNvY2tldC1jbGllbnRcIjtcclxuaW1wb3J0IHsgQ2xpZW50T3B0aW9ucyB9IGZyb20gXCJyc29ja2V0LXdlYnNvY2tldC1jbGllbnQvUlNvY2tldFdlYlNvY2tldENsaWVudFwiO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmVzIGFuZCBjcmVhdGVzIGFuIGluc3RhbmNlIG9mIFJTb2NrZXRDbGllbnRcclxuICpcclxuICogQHBhcmFtIHVybCB0aGUgRW5kcG9pbnRcclxuICogQHJldHVybnMgYSBuZXcgaW5zdGFuY2Ugb2YgUlNvY2tldENsaWVudFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNsaWVudCh1cmw6IHN0cmluZyk6IFJTb2NrZXRDbGllbnQ8YW55LCBhbnk+IHtcclxuICAgIGNvbnN0IG9wdGlvbnM6IENsaWVudE9wdGlvbnMgPSB7XHJcbiAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgd3NDcmVhdG9yOiAodXJsKSA9PiB7IHJldHVybiBuZXcgV2ViU29ja2V0KHVybCkgfVxyXG4gICAgfVxyXG4gICAgY29uc3Qgd3NDbGllbnQgPSBuZXcgUlNvY2tldFdlYlNvY2tldENsaWVudChvcHRpb25zKTtcclxuICAgIGNvbnN0IGNvbmZpZzogQ2xpZW50Q29uZmlnPGFueSwgYW55PiA9IHtcclxuICAgICAgICBzZXJpYWxpemVyczoge1xyXG4gICAgICAgICAgICBkYXRhOiBKc29uU2VyaWFsaXplcixcclxuICAgICAgICAgICAgbWV0YWRhdGE6IElkZW50aXR5U2VyaWFsaXplclxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0dXA6IHtcclxuICAgICAgICAgICAga2VlcEFsaXZlOiA2MDAwMCxcclxuICAgICAgICAgICAgbGlmZXRpbWU6IDE4MDAwMCxcclxuICAgICAgICAgICAgZGF0YU1pbWVUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgIG1ldGFkYXRhTWltZVR5cGU6ICdtZXNzYWdlL3gucnNvY2tldC5yb3V0aW5nLnYwJyxcclxuICAgICAgICAgICAgcGF5bG9hZDoge1xyXG4gICAgICAgICAgICAgICAgZGF0YTogJ29uZScsXHJcbiAgICAgICAgICAgICAgICBtZXRhZGF0YTogU3RyaW5nLmZyb21DaGFyQ29kZSgnY29ubmVjdCcubGVuZ3RoKSArICdjb25uZWN0J1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhbnNwb3J0OiB3c0NsaWVudFxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBSU29ja2V0Q2xpZW50KGNvbmZpZyk7XHJcbn0iLCJpbXBvcnQgeyBQYXlsb2FkLCBSZWFjdGl2ZVNvY2tldCB9IGZyb20gJ3Jzb2NrZXQtdHlwZXMnO1xyXG5pbXBvcnQgeyBTaW5nbGUgfSBmcm9tIFwicnNvY2tldC1mbG93YWJsZVwiO1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgcmVjZWl2ZXMgbG9jYWwgcmVxdWVzdCBhbmQgdHJhbnNmZXJzIHRoZW0gdG8gdGhlIFJTb2NrZXRTZXJ2ZXIsXHJcbiAqIHRocm91Z2ggdGhlIHNvY2tldFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNlcnZlclByb3h5IHtcclxuICAgIHByaXZhdGUgc29ja2V0OiBSZWFjdGl2ZVNvY2tldDxhbnksIGFueT47XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc29ja2V0OiBSZWFjdGl2ZVNvY2tldDxhbnksIGFueT4pIHtcclxuICAgICAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZmluZFVzZXJCeUlkKGlkOiBudW1iZXIpOiBTaW5nbGU8UGF5bG9hZDxhbnksIGFueT4+IHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImZpblVzZXJJZCgpIGNhbGxlZFwiKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5zb2NrZXQucmVxdWVzdFJlc3BvbnNlKHtcclxuICAgICAgICAgICAgZGF0YTogaWQsXHJcbiAgICAgICAgICAgIG1ldGFkYXRhOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCd1c2VyJy5sZW5ndGgpICsgJ3VzZXInXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufSIsImltcG9ydCB7IFRlbXBsYXRlU2VydmVyIH0gZnJvbSBcIkB0cml2aWFsLXB1cnN1aXQtY2xpZW50L2FwaVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdlYnNvY2tldFNlcnZlciBpbXBsZW1lbnRzIFRlbXBsYXRlU2VydmVyIHtcclxuICAgIGNvbm5lY3QodXNlcjogU3RyaW5nLCBwYXNzd29yZDogU3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJBcHBlbCBkZSBXZWJzb2NrZXRTZXJ2ZXI6OmNvbm5lY3QoXCIgKyB1c2VyICsgXCIsIFwiICsgcGFzc3dvcmQgKyBcIilcIik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBkaXNjb25uZWN0KCk6IHZvaWQge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiQXBwZWwgZGUgZGlzY29ubmVjdCgpXCIpO1xyXG4gICAgfVxyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICBkZXNjID0geyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9O1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pKTtcclxudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XHJcbn07XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NlcnZlclwiKSwgZXhwb3J0cyk7XHJcbi8vY29uc29sZS5sb2coXCJTYWx1dCBkZSBsYSBwYXJ0IGQnQVBJICFcIik7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNlcnZlci5qcy5tYXAiLCIvKiAoaWdub3JlZCkgKi8iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==