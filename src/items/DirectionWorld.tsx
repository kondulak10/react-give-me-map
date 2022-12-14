import React from 'react';
import { Marker } from 'react-map-gl';
import { useCtx } from '../context/dynamic/provider';
import { IDirectionWorldMarker } from '../utils/world/worldTypes';
import { FeatureRoute } from './geojson/FeatureRoute';
import { S_DotPin } from './PinWorld';

interface Props {
    marker: IDirectionWorldMarker;
    onSelected?: () => void;
}

export const DirectionWorld = (props: Props): JSX.Element => {
    const id = props.marker.id;
    const elementData = props.marker.elementData;
    const { state } = useCtx();

    return (
        <>
            <Marker
                longitude={elementData.start.lng}
                latitude={elementData.start.lat}
                onClick={() => {
                    //select
                    // dispatch(setSelectedMarkers([id]));
                    // dispatch(setWorldAction(EWorldAction.SELECT));
                    // state.callbacks.onMarkersSelected?.([id]);
                    props.onSelected?.();
                }}
                style={{
                    opacity: state.selectedIds.includes(id) ? 0.25 : 1
                }}
            >
                <div ref={props.marker.refs?.[0]}>
                    <S_DotPin dotColor={elementData.lineColor} />
                </div>
            </Marker>

            {elementData.coordinates?.length > 0 && (
                <FeatureRoute
                    id={id}
                    coordinates={elementData.coordinates}
                    lineColor={elementData.lineColor}
                    lineOpacity={elementData.lineOpacity}
                    dropShadowColor={elementData.dropShadowColor}
                />
            )}

            <Marker
                longitude={elementData.end.lng}
                latitude={elementData.end.lat}
                onClick={() => {
                    //select
                    // dispatch(setSelectedMarkers([id]));
                    // dispatch(setWorldAction(EWorldAction.SELECT));
                    // state.callbacks.onMarkersSelected?.([id]);
                    props.onSelected?.();
                }}
                style={{
                    opacity: state.selectedIds.includes(id) ? 0.25 : 1
                }}
            >
                <div ref={props.marker.refs?.[props.marker.refs?.length - 1]}>
                    <S_DotPin dotColor={elementData.lineColor} />
                </div>
            </Marker>
        </>
    );
};
