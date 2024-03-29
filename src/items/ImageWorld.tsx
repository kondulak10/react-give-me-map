import React from 'react';
import { IImageWorld } from '../utils/world/worldTypes';
import { ImageWorldLayer } from './geojson/ImageWorldLayer';

interface Props {
    markerId: string;
    elementData: IImageWorld;
    adjustedScale: number;
    onResizeNeeded?: () => void;

    onClick?: (e: React.MouseEvent) => void;

    nativeMarkerIdsOrder: string[];
}

type AllowedResolutions = keyof NonNullable<IImageWorld['additionalSrc']>;
const orderedAllowedResolutions = [100, 600, 1000, 1920];
const markerImgWidth = 250;

const generateImageUrlFor = (elementData: IImageWorld, adjustedScale: number): string => {
    const { additionalSrc, src } = elementData;

    if (!additionalSrc) {
        return elementData.src;
    }

    const resolution = orderedAllowedResolutions.find(
        (resolution) => resolution > markerImgWidth * 2 * adjustedScale
    );

    if (resolution) {
        return additionalSrc[resolution as AllowedResolutions] ?? src;
    }

    return src;
};

export const ImageWorld = (props: Props): JSX.Element => {
    const getPixelInScale = (val: number | undefined) => (val ? val * props.adjustedScale : val);
    const getShadowInScale = (str: string | undefined) =>
        (str || '')
            .split('px')
            .map((e) => (!isNaN(parseFloat(e)) ? `${parseFloat(e) * 1.34344}px` : e))
            .join(' ');

    if (props.elementData.renderAsLayer) {
        return (
            <ImageWorldLayer
                nativeMarkerIdsOrder={props.nativeMarkerIdsOrder}
                markerId={props.markerId}
                layerData={props.elementData.layerData ?? {}}
                imageUrl={props.elementData.src}
            />
        );
    }

    return (
        <div>
            <img
                onClick={props.onClick}
                width={markerImgWidth * props.adjustedScale}
                src={generateImageUrlFor(props.elementData, props.adjustedScale)}
                style={{
                    borderRadius: `${props.elementData.borderRadiusPx}px`,
                    borderWidth: `${getPixelInScale(props.elementData.borderSize)}px`,
                    borderStyle: 'solid',
                    borderColor: props.elementData.borderColor,
                    boxShadow: getShadowInScale(props.elementData.dropShadowCombined)
                }}
            />
        </div>
    );
};
