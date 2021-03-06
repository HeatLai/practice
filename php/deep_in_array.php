<?php

//檢查多維陣列內數值是否存在
function deepInArray( $value, $targetArray )
{
    foreach ( $targetArray as $arrayValue )
    {
        if ( ! is_array( $arrayValue ) )
        {
            if ( $value == $arrayValue )
            {
                return true;
            }
        }
        else
        {
            if ( deepInArray( $value, $arrayValue ) )
            {
                return true;
            }
        }
    }

    return false;
}